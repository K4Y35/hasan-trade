'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, getCustomerToken, setCustomerSession } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (getCustomerToken()) router.replace('/account/orders');
  }, [router]);

  return (
    <main className="mx-auto max-w-md px-4 py-16 md:px-6">
      <p className="section-kicker">Account</p>
      <h1 className="section-title">Create account</h1>
      <p className="section-lede">Save orders to this email so you can check status after delivery is booked.</p>
      <form
        className="card mt-8 space-y-4 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          try {
            const data = await api<{ accessToken: string; refreshToken: string }>('/v1/auth/register', {
              method: 'POST',
              body: JSON.stringify(form),
            });
            setCustomerSession(data.accessToken, data.refreshToken);
            router.push('/account/orders');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not register');
          }
        }}
      >
        <label className="block text-sm font-medium">
          Name
          <input className="field mt-1" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input className="field mt-1" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="block text-sm font-medium">
          Phone
          <input className="field mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            className="field mt-1"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error ? <p className="text-red-600">{error}</p> : null}
        <button className="btn-primary w-full">Register</button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/account/login" className="font-semibold text-[var(--color-primary)]">
          Sign in
        </Link>
      </p>
    </main>
  );
}
