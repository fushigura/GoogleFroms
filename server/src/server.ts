import express from 'express';
import cors from 'cors';
import { schema } from './schema';
import { createHandler } from 'graphql-http/lib/use/express';

const app = express();
app.use(cors());
app.use(express.json());

app.all('/graphql', createHandler({ schema }));

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000/graphql');
});