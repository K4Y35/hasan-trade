import type { CartItem, Product } from './types';

const KEY = 'shopstack_cart';

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('shopstack-cart'));
}

export function cartItemFromProduct(product: Product): Omit<CartItem, 'quantity'> | null {
  const variant = product.variants.find((item) => item.isDefault) ?? product.variants[0];
  if (!variant) return null;
  return {
    variantId: variant.id,
    productId: product.id,
    name: product.name,
    sku: variant.sku,
    price: variant.price ?? 0,
    slug: product.slug,
    imageUrl: product.images[0]?.url,
  };
}

export function addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1) {
  const items = readCart();
  const existing = items.find((i) => i.variantId === item.variantId);
  if (existing) {
    existing.quantity += quantity;
    if (!existing.imageUrl && item.imageUrl) existing.imageUrl = item.imageUrl;
  } else items.push({ ...item, quantity });
  writeCart(items);
}

export function setCartQuantity(variantId: string, quantity: number) {
  const next = readCart()
    .map((item) => (item.variantId === variantId ? { ...item, quantity: Math.max(1, quantity) } : item))
    .filter((item) => item.quantity > 0);
  writeCart(next);
  return next;
}

export function removeFromCart(variantId: string) {
  const next = readCart().filter((item) => item.variantId !== variantId);
  writeCart(next);
  return next;
}

export function cartCount() {
  return readCart().reduce((s, i) => s + i.quantity, 0);
}

export function cartTotal() {
  return readCart().reduce((s, i) => s + i.price * i.quantity, 0);
}
