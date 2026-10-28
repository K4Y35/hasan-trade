'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearCustomerSession } from '@/lib/api';

export function AccountBar({ name }: { name?: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="section-kicker">Account</p>
        <h1 className="section-title">{name ? `Hello, ${name.split(' ')[0]}` : 'Your orders'}</h1>
      </div>
      <div className="flex gap-3 text-sm font-medium">
        <Link href="/shop" className="text-slate-500 hover:text-[var(--color-primary)]">
          Continue shopping
        </Link>
        <button
          type="button"
          className="text-slate-500 hover:text-[var(--color-secondary)]"
          onClick={() => {
            clearCustomerSession();
            router.push('/account/login');
            router.refresh();
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
