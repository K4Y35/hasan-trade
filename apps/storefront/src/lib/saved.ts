import type { Product } from './types';

const WISH_KEY = 'shopstack_wishlist';
const COMPARE_KEY = 'shopstack_compare';
const COMPARE_LIMIT = 4;

function readList(key: string): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]') as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key: string, items: Product[]) {
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event('shopstack-saved'));
}

export function readWishlist() {
  return readList(WISH_KEY);
}

export function readCompare() {
  return readList(COMPARE_KEY);
}

export function isWishlisted(productId: string) {
  return readWishlist().some((item) => item.id === productId);
}

export function isCompared(productId: string) {
  return readCompare().some((item) => item.id === productId);
}

export function wishlistCount() {
  return readWishlist().length;
}

export function compareCount() {
  return readCompare().length;
}

export function toggleWishlist(product: Product) {
  const items = readWishlist();
  const next = items.some((item) => item.id === product.id)
    ? items.filter((item) => item.id !== product.id)
    : [product, ...items];
  writeList(WISH_KEY, next);
  return next.some((item) => item.id === product.id);
}

export function removeWishlist(productId: string) {
  writeList(
    WISH_KEY,
    readWishlist().filter((item) => item.id !== productId),
  );
}

export function clearWishlist() {
  writeList(WISH_KEY, []);
}

export function toggleCompare(product: Product) {
  const items = readCompare();
  if (items.some((item) => item.id === product.id)) {
    const next = items.filter((item) => item.id !== product.id);
    writeList(COMPARE_KEY, next);
    return { added: false, items: next, full: false };
  }
  if (items.length >= COMPARE_LIMIT) {
    return { added: false, items, full: true };
  }
  const next = [product, ...items];
  writeList(COMPARE_KEY, next);
  return { added: true, items: next, full: false };
}

export function removeCompared(productId: string) {
  writeList(
    COMPARE_KEY,
    readCompare().filter((item) => item.id !== productId),
  );
}

export function clearCompare() {
  writeList(COMPARE_KEY, []);
}
