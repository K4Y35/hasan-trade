'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, getCustomerToken, setCustomerSession } from '@/lib/api';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (getCustomerToken()) router.replace('/account/orders');
  }, [router]);

  return (
    <main className="mx-auto max-w-md px-4 py-16 md:px-6">
      <p className="section-kicker">Account</p>
      <h1 className="section-title">Sign in</h1>
      <p className="section-lede">Access orders after checkout. Guest checkout still works without an account.</p>
      <form
        className="card mt-8 space-y-4 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          try {
            const data = await api<{ accessToken: string; refreshToken: string }>('/v1/auth/login', {
              method: 'POST',
              body: JSON.stringify({ email, password }),
            });
            setCustomerSession(data.accessToken, data.refreshToken);
            router.push('/account/orders');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
          }
        }}
      >
        <label className="block text-sm font-medium">
          Email
          <input className="field mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input className="field mt-1" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error ? <p className="text-red-600">{error}</p> : null}
        <button className="btn-primary w-full">Sign in</button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        New here?{' '}
        <Link href="/account/register" className="font-semibold text-[var(--color-primary)]">
          Create an account
        </Link>
      </p>
    </main>
  );
}
