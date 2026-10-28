import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center md:px-6">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={32} />
      </span>
      <p className="section-kicker mt-6">Cash on delivery</p>
      <h1 className="section-title">Order placed</h1>
      <p className="mt-4 text-slate-600">
        {order ? (
          <>
            Your order <span className="font-semibold text-slate-900">{order}</span> is confirmed.
          </>
        ) : (
          'Your order is confirmed.'
        )}{' '}
        Pay with cash when it arrives.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/account/orders" className="btn-primary">
          View orders
        </Link>
        <Link href="/shop" className="btn-ghost rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
