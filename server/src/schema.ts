import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID, GraphQLList, GraphQLInputObjectType, GraphQLNonNull, GraphQLEnumType } from 'graphql';

// In-memory storage
const forms: any[] = [];
const responses: any[] = [];

// Типи GraphQL
const QuestionTypeEnum = new GraphQLEnumType({
  name: 'QuestionType',
  values: {
    TEXT: { value: 'TEXT' },
    MULTIPLE_CHOICE: { value: 'MULTIPLE_CHOICE' },
    CHECKBOX: { value: 'CHECKBOX' },
    DATE: { value: 'DATE' }
  }
});

const AnswerType = new GraphQLObjectType({
  name: 'Answer',
  fields: () => ({
    questionId: { type: GraphQLID },
    value: { type: GraphQLString }
  })
});

const QuestionType = new GraphQLObjectType({
  name: 'Question',
  fields: () => ({
    id: { type: GraphQLID },
    type: { type: QuestionTypeEnum },
    text: { type: GraphQLString },
    options: { type: new GraphQLList(GraphQLString) } // для MULTIPLE_CHOICE/ CHECKBOX
  })
});

const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: () => ({
    formId: { type: GraphQLID },
    answers: { type: new GraphQLList(AnswerType) }
  })
});

const FormType = new GraphQLObjectType({
  name: 'Form',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    questions: { type: new GraphQLList(QuestionType) }
  })
});

// Input типи для мутацій
const QuestionInputType = new GraphQLInputObjectType({
  name: 'QuestionInput',
  fields: () => ({
    type: { type: QuestionTypeEnum },
    text: { type: new GraphQLNonNull(GraphQLString) },
    options: { type: new GraphQLList(GraphQLString) }
  })
});

const AnswerInputType = new GraphQLInputObjectType({
  name: 'AnswerInput',
  fields: () => ({
    questionId: { type: new GraphQLNonNull(GraphQLID) },
    value: { type: new GraphQLNonNull(GraphQLString) }
  })
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    forms: {
      type: new GraphQLList(FormType),
      resolve: () => forms
    },
    form: {
      type: FormType,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }) => forms.find(f => f.id === id)
    },
    responses: {
      type: new GraphQLList(ResponseType),
      args: { formId: { type: GraphQLID } },
      resolve: (_, { formId }) => responses.filter(r => r.formId === formId)
    }
  }
});

// Root Mutation
const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createForm: {
      type: FormType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        questions: { type: new GraphQLList(QuestionInputType) }
      },
      resolve: (_: any, { title, description, questions }: { title: string; description?: string; questions?: any[] }) => {
        const form = {
          id: (forms.length + 1).toString(),
          title,
          description,
          questions: (questions ?? []).map((q, idx) => ({ ...(q as any), id: (idx + 1).toString() }))
        };
        forms.push(form);
        return form;
      }
    },
    submitResponse: {
      type: ResponseType,
      args: {
        formId: { type: new GraphQLNonNull(GraphQLID) },
        answers: { type: new GraphQLList(AnswerInputType) }
      },
      resolve: (_, { formId, answers }) => {
        const response = { formId, answers };
        responses.push(response);
        return response;
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});