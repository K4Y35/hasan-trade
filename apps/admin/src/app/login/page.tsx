'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from '@/components/brand-logo';
import { api, setSession } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('ChangeMe!123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api<{
        accessToken: string;
        refreshToken: string;
        user: { kind: string };
      }>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.user.kind !== 'STAFF') {
        setError('This account cannot open the admin. Use a staff login.');
        return;
      }
      setSession(data.accessToken, data.refreshToken);
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in. Check email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-ink)] p-6">
      <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-[var(--color-accent)]/20 blur-3xl motion-safe:animate-admin-float" />
      <div className="pointer-events-none absolute -right-10 bottom-8 h-64 w-64 rounded-full bg-[var(--color-primary)]/40 blur-3xl motion-safe:animate-admin-float-alt" />
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-40 w-40 rounded-full border border-white/10" />

      <form onSubmit={onSubmit} className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-lift" noValidate>
        <BrandLogo height={52} className="mb-5" />
        <p className="page-kicker">ShopStack</p>
        <h1 className="page-title">Admin sign in</h1>
        <p className="page-lede">Catalog, orders, inventory and POS for Hasan Trade Electronics.</p>
        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          className="mt-1"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          autoFocus
          required
          aria-invalid={Boolean(error)}
        />
        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="admin-password">
          Password
        </label>
        <div className="relative mt-1">
          <input
            id="admin-password"
            className="pr-12"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            aria-invalid={Boolean(error)}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:text-slate-800"
            onClick={() => setShowPassword((open) => !open)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <button className="primary mt-6 w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
