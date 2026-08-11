const rawBase = (import.meta as any).env?.VITE_API_BASE_URL || 'https://crm-mini-erp-backend.onrender.com/api';
const API_BASE = rawBase.replace(/\/+$/, '');

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const apiRequest = async <T = any>(
  endpoint: string,
  options: { method?: string; body?: any; token?: string } = {}
): Promise<T> => {
  const token = options.token || getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE}${formattedEndpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || 'API Request Failed';
    const err = new Error(errorMsg) as any;
    err.status = response.status;
    err.details = data.details || null;
    throw err;
  }

  return data as T;
};
