const STOREFRONT_URL = (process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export function mediaUrl(url?: string | null) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads')) return `${API_URL}${url}`;
  if (url.startsWith('/')) return `${STOREFRONT_URL}${url}`;
  return url;
}
