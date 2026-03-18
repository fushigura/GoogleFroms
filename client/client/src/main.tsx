import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './router/Router'
import { ApolloProvider } from '@apollo/client/react';
import { client } from './graphql/client';

createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <AppRouter />
  </ApolloProvider>,
)