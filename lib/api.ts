export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { 
    ...options, 
    headers, 
    credentials: 'include'  // ensure cookies are sent automatically
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'API request failed');
  }
  return res.json();
}
