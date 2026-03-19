import { gql } from '@apollo/client';
import { client } from '../../graphql/client';

type QuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DATE';

export interface QuestionInput {
  type: QuestionType;
  text: string;
  options?: string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

const CREATE_FORM = gql`
  mutation CreateForm($title: String!, $description: String, $questions: [QuestionInput]) {
    createForm(title: $title, description: $description, questions: $questions) {
      id
      title
      description
      questions {
        id
        text
        type
        options
      }
    }
  }
`;

const UPDATE_FORM = gql`
  mutation UpdateForm($id: ID!, $title: String!, $description: String, $questions: [QuestionInput]) {
    updateForm(id: $id, title: $title, description: $description, questions: $questions) {
      id
      title
      description
      questions {
        id
        text
        type
        options
      }
    }
  }
`;

export async function createForm(
  title: string,
  description?: string,
  questions?: QuestionInput[]
): Promise<Form | undefined> {
  const result = await client.mutate<{ createForm: Form }, { title: string; description?: string; questions?: QuestionInput[] }>({
    mutation: CREATE_FORM,
    variables: { title, description, questions },
    update: (cache, { data }) => {
      const newForm = data?.createForm;
      if (!newForm) return;

      cache.modify({
        fields: {
          forms(existing: any[] = []) {
            const newRef = cache.writeFragment({
              data: newForm,
              fragment: gql`
                fragment NewForm on Form {
                  id
                  title
                  description
                  questions {
                    id
                    text
                    type
                    options
                  }
                }
              `
            });
            // avoid duplicates by id
            const existingIds = existing
              .map(ref => {
                try {
                  return cache.readFragment<{ id: string }>({
                    id: cache.identify(ref),
                    fragment: gql`fragment FormId on Form { id }`
                  })?.id;
                } catch {
                  return undefined;
                }
              })
              .filter(Boolean);

            if (existingIds.includes(newForm.id)) return existing;
            return [...existing, newRef];
          }
        }
      });
    }
  });

  return result.data?.createForm;
}

export async function updateForm(
  id: string,
  title: string,
  description?: string,
  questions?: QuestionInput[]
): Promise<Form | undefined> {
  const result = await client.mutate<{ updateForm: Form }, { id: string; title: string; description?: string; questions?: QuestionInput[] }>({
    mutation: UPDATE_FORM,
    variables: { id, title, description, questions },
    update: (cache, { data }) => {
      const updated = data?.updateForm;
      if (!updated) return;

      cache.modify({
        fields: {
          forms(existing: any[] = [], { readField }) {
            return existing.map(ref => {
              const refId = readField<string>('id', ref);
              if (refId !== updated.id) return ref;

              return cache.writeFragment({
                data: updated,
                fragment: gql`
                  fragment UpdatedForm on Form {
                    id
                    title
                    description
                    questions {
                      id
                      text
                      type
                      options
                    }
                  }
                `
              });
            });
          }
        }
      });
    }
  });

  return result.data?.updateForm;
}