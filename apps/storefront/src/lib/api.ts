const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const TOKEN_KEY = 'shopstack_customer_token';

export function getCustomerToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerSession(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem('shopstack_customer_refresh', refreshToken);
}

export function clearCustomerSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('shopstack_customer_refresh');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = getCustomerToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API}${path}`, { ...options, headers, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function publicApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}
