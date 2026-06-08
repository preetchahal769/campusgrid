const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Track if we are currently refreshing the token to avoid multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBaseUrl}${cleanEndpoint}`;
  
  const headers: Record<string, string> = {
    ...Object.fromEntries(Object.entries(options.headers || {}) as [string, string][]),
  };

  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('cg_access_token');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  // If body is FormData, fetch will automatically set the correct multipart/form-data header with boundary
  if (!(options.body instanceof FormData)) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const defaultOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers,
  };

  try {
    let response = await fetch(url, defaultOptions);
    
    // Handle unauthorized (401)
    if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('cg_refresh_token') : null;
        
        refreshPromise = fetch(`${cleanBaseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        }).then(async res => {
          isRefreshing = false;
          if (!res.ok) throw new Error(`Refresh failed with status ${res.status}`);
          
          const refreshData = await res.json();
          if (typeof window !== 'undefined' && refreshData?.tokens) {
            localStorage.setItem('cg_access_token', refreshData.tokens.accessToken);
            localStorage.setItem('cg_refresh_token', refreshData.tokens.refreshToken);
          }
          return refreshData;
        }).catch(err => {
          isRefreshing = false;
          throw err;
        });
      }

      try {
        await refreshPromise;
        // Retry the original request with the new token
        if (typeof window !== 'undefined') {
          const newAccessToken = localStorage.getItem('cg_access_token');
          if (newAccessToken) {
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            defaultOptions.headers = headers;
          }
        }
        response = await fetch(url, defaultOptions);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          // Clear persisted auth state to prevent redirect loops
          localStorage.removeItem('cg_user');
          localStorage.removeItem('cg_role');
          localStorage.removeItem('cg_profile');
          localStorage.removeItem('nexus_schools');
          localStorage.removeItem('nexus_finance');
          localStorage.removeItem('cg_access_token');
          localStorage.removeItem('cg_refresh_token');
          
          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    if (response.status === 204 || endpoint === '/auth/logout') {
      if (endpoint === '/auth/logout' && typeof window !== 'undefined') {
        localStorage.removeItem('cg_user');
        localStorage.removeItem('cg_role');
        localStorage.removeItem('cg_profile');
        localStorage.removeItem('nexus_schools');
        localStorage.removeItem('nexus_finance');
        localStorage.removeItem('cg_access_token');
        localStorage.removeItem('cg_refresh_token');
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBaseUrl}${cleanPath}`;
};