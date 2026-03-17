import express from 'express';
import cors from 'cors';
import { schema } from './schema';

const raw = require('express-graphql');
const graphqlHTTP: any = (raw && raw.graphqlHTTP) ? raw.graphqlHTTP : raw;

const app = express();
app.use(cors());
app.use(express.json());

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000/graphql');
});