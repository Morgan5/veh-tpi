import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useAuthStore } from '../store/authStore';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql/',
});

const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().token;
  return {
    headers: {
      ...headers,
      authorization: token ? `JWT ${token}` : "",
    }
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }
  
  if (networkError) {
    console.error(`Network error: ${networkError}`);
    if (networkError.statusCode === 401) {
      useAuthStore.getState().logout();
    }
  }
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});