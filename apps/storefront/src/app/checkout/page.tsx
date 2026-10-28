'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { readCart, writeCart } from '@/lib/cart';
import { formatPrice } from '@/lib/money';
import type { CartItem } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    line1: '',
    district: 'Sylhet',
    division: 'Sylhet',
    notes: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number; payable: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const cart = readCart();
    if (!cart.length) {
      router.replace('/cart');
      return;
    }
    setItems(cart);
    api<{ user: { name: string; email: string | null; phone: string | null } }>('/v1/auth/me')
      .then(({ user }) => {
        setForm((current) => ({
          ...current,
          name: current.name || user.name || '',
          email: current.email || user.email || '',
          phone: current.phone || user.phone || '',
        }));
      })
      .catch(() => undefined);
  }, [router]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const cart = readCart();
    try {
      const order = await api<{ orderNumber: string }>('/v1/checkout', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          notes: form.notes || undefined,
          payment: 'COD',
          couponCode: coupon?.code,
          shippingAddress: {
            name: form.name,
            phone: form.phone,
            line1: form.line1,
            district: form.district,
            division: form.division,
          },
          items: cart.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });
      writeCart([]);
      router.push(`/checkout/thanks?order=${order.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setSubmitting(false);
    }
  }

  if (!items.length) return null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <p className="section-kicker">Cash on delivery</p>
      <h1 className="section-title">Checkout</h1>
      <p className="section-lede">Pay when the order arrives. Leave a phone number the delivery team can reach.</p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Delivery details</h2>
          <label className="block text-sm font-medium">
            Full name
            <input className="field mt-1" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="block text-sm font-medium">
            Phone
            <input className="field mt-1" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="block text-sm font-medium">
            Email (optional)
            <input className="field mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block text-sm font-medium">
            Address
            <input className="field mt-1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              District
              <input className="field mt-1" required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </label>
            <label className="block text-sm font-medium">
              Division
              <input className="field mt-1" required value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Notes (optional)
            <textarea className="field mt-1" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          {error ? <p className="text-red-600">{error}</p> : null}
        </div>

        <aside className="card sticky top-28 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between gap-3">
                <span className="text-slate-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {coupon ? (
              <div className="flex justify-between text-emerald-700">
                <span>{coupon.code}</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span className="text-[var(--color-primary)]">{formatPrice(total)}</span>
            </div>
          </div>
          <div className="mt-4">
            {coupon ? (
              <p className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <span>{coupon.code} applied</span>
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => {
                    setCoupon(null);
                    setCouponCode('');
                    setCouponError('');
                  }}
                >
                  Remove
                </button>
              </p>
            ) : (
              <div className="flex gap-2">
                <label className="sr-only" htmlFor="coupon-code">
                  Coupon code
                </label>
                <input
                  id="coupon-code"
                  className="field flex-1"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError('');
                  }}
                  placeholder="Coupon code"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="btn-ghost rounded-lg border border-slate-200 px-3 text-sm font-semibold disabled:opacity-50"
                  disabled={applying || !couponCode.trim()}
                  onClick={async () => {
                    setApplying(true);
                    setCouponError('');
                    try {
                      const cart = readCart();
                      const applied = await api<{ code: string; discount: number; payable: number }>('/v1/checkout/coupon', {
                        method: 'POST',
                        body: JSON.stringify({
                          code: couponCode,
                          items: cart.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
                        }),
                      });
                      setCoupon(applied);
                    } catch (err) {
                      setCoupon(null);
                      setCouponError(err instanceof Error ? err.message : 'That code could not be applied');
                    } finally {
                      setApplying(false);
                    }
                  }}
                >
                  {applying ? 'Checking…' : 'Apply'}
                </button>
              </div>
            )}
            {couponError ? <p className="mt-2 text-sm text-red-600">{couponError}</p> : null}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">Payment method: cash on delivery. No payment is collected online.</p>
          <button className="btn-primary mt-5 w-full" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
          <Link href="/cart" className="mt-3 flex w-full items-center justify-center text-sm font-medium text-slate-600 hover:text-[var(--color-primary)]">
            Back to cart
          </Link>
        </aside>
      </form>
    </main>
  );
}
