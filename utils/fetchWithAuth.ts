// utils/fetchWithAuth.ts

/**
 * A wrapper around fetch that handles token refresh and authentication
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise resolving to the fetch response
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include'
      });
  
      // If unauthorized (401), attempt to refresh token
      if (response.status === 401) {
        try {
          // Attempt to refresh token
          const refreshResponse = await fetch('/api/users/refresh', {
            method: 'POST',
            credentials: 'include'
          });
  
          if (refreshResponse.ok) {
            // Retry the original request
            return fetch(url, {
              ...options,
              credentials: 'include'
            });
          } else {
            // If refresh fails, throw an error
            throw new Error('Session expired');
          }
        } catch (refreshError) {
          // If any error occurs during refresh, rethrow
          throw refreshError;
        }
      }
  
      return response;
    } catch (error) {
      // Rethrow any other errors
      throw error;
    }
  };
  
  // Utility methods to match fetch API
  export const fetchWithAuthJson = async (url: string, options: RequestInit = {}) => {
    const response = await fetchWithAuth(url, options);
    return response.json();
  };