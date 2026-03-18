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

/**
 * Створює форму на сервері і додає її в Apollo cache
 */
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

      // Додаємо нову форму в корінний запит "forms"
      cache.modify({
        fields: {
          forms(existing = []) {
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
            return [...existing, newRef];
          }
        }
      });
    }
  });

  return result.data?.createForm;
}