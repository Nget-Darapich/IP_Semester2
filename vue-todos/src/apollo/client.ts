import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client/core'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

function getHeaders() {
  return {
    'x-hasura-role': import.meta.env.VITE_HASURA_ROLE as string,
    'x-hasura-admin-secret': import.meta.env.VITE_HASURA_ADMIN_SECRET as string,
  }
}

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_HASURA_HTTP as string,
  headers: getHeaders(),
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_HASURA_WS as string,
    connectionParams: async () => ({
      headers: getHeaders(),
    }),
  }),
)

const link = split(
  ({ query }) => {
    const def = getMainDefinition(query)
    return def.kind === 'OperationDefinition' && def.operation === 'subscription'
  },
  wsLink,
  httpLink,
)

export const cache = new InMemoryCache()

export const apolloClient = new ApolloClient({
  link,
  cache,
})