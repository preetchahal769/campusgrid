import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

let BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
if (BASE_URL && !BASE_URL.startsWith('http')) {
  BASE_URL = `https://${BASE_URL}`;
}
const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

const customFetch = async (input: any, init: any) => {
  const startTime = Date.now();
  const response = await fetch(input, init);
  
  if (typeof window !== 'undefined') {
    const duration = Date.now() - startTime;
    const metrics = (window as any).apiMetrics || [];
    
    let opName = 'GraphQL Query';
    try {
      const body = JSON.parse(init.body);
      opName = body.operationName || 'GraphQL Query';
    } catch (e) {}

    metrics.unshift({
      endpoint: `/graphql (${opName})`,
      method: 'POST',
      status: response.status,
      durationMs: duration,
      timestamp: new Date().toLocaleTimeString()
    });
    (window as any).apiMetrics = metrics.slice(0, 15);
  }
  
  return response;
};

const httpLink = createHttpLink({
  uri: `${cleanBaseUrl}/graphql`,
  fetch: customFetch,
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cg_access_token') : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
