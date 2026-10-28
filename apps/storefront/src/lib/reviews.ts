import type { ProductReview } from './types';

function key(slug: string) {
  return `shopstack_reviews_${slug}`;
}

export function readReviews(slug: string): ProductReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key(slug)) ?? '[]') as ProductReview[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addReview(slug: string, input: Omit<ProductReview, 'id' | 'createdAt'>) {
  const items = readReviews(slug);
  const next: ProductReview = {
    ...input,
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(key(slug), JSON.stringify([next, ...items]));
  return next;
}
