import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { Observable } from '@apollo/client/utilities';

let BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
if (BASE_URL && !BASE_URL.startsWith('http')) {
  BASE_URL = `https://${BASE_URL}`;
}
const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

// Track if we are currently refreshing the token to avoid multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const getNewToken = async (): Promise<string | null> => {
  console.log('[Apollo getNewToken] Attempting token refresh. isRefreshing:', isRefreshing);
  if (isRefreshing && refreshPromise) {
    console.log('[Apollo getNewToken] Refresh already in progress, returning existing promise.');
    return refreshPromise;
  }
  isRefreshing = true;
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('cg_refresh_token') : null;
  console.log('[Apollo getNewToken] Retrieved refresh token:', refreshToken ? `${refreshToken.substring(0, 10)}...` : 'null');
  if (!refreshToken) {
    isRefreshing = false;
    console.warn('[Apollo getNewToken] No refresh token found in localStorage.');
    return null;
  }

  refreshPromise = fetch(`${cleanBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    credentials: 'include',
  })
    .then(async (res) => {
      isRefreshing = false;
      console.log('[Apollo getNewToken] Refresh response status:', res.status);
      if (!res.ok) throw new Error(`Refresh failed with status ${res.status}`);
      const data = await res.json();
      if (typeof window !== 'undefined' && data?.tokens) {
        console.log('[Apollo getNewToken] Successfully refreshed tokens. New access token:', `${data.tokens.accessToken.substring(0, 10)}...`);
        localStorage.setItem('cg_access_token', data.tokens.accessToken);
        localStorage.setItem('cg_refresh_token', data.tokens.refreshToken);
        return data.tokens.accessToken;
      }
      console.warn('[Apollo getNewToken] Refresh response did not contain expected tokens structure.');
      return null;
    })
    .catch((err) => {
      isRefreshing = false;
      console.error('[Apollo getNewToken] Refresh error encountered:', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cg_access_token');
        localStorage.removeItem('cg_refresh_token');
        localStorage.removeItem('cg_user');
        localStorage.removeItem('cg_role');
        window.location.href = '/login';
      }
      return null;
    });

  return refreshPromise;
};

const customFetch = async (input: any, init: any) => {
  const startTime = Date.now();
  const newInit = { ...init };
  newInit.headers = { ...init.headers };

  let response = await fetch(input, newInit);
  
  if (response.status === 401) {
    console.log('[Apollo customFetch] Intercepted 401 status. Refreshing token...');
    try {
      const newToken = await getNewToken();
      if (newToken) {
        console.log('[Apollo customFetch] Token refreshed successfully. Retrying request...');
        newInit.headers['authorization'] = `Bearer ${newToken}`;
        response = await fetch(input, newInit);
      }
    } catch (refreshErr) {
      console.error('[Apollo customFetch] Token refresh retry failed:', refreshErr);
    }
  }
  
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
