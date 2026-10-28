'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';

type Coverage = {
  id: string;
  serial: string;
  status: string;
  startDate: string;
  endDate: string;
  canClaim: boolean;
  product: { name: string };
  openClaim: { id: string; status: string; description: string; createdAt: string } | null;
  latestClaim: { status: string; resolution: string | null; createdAt: string } | null;
};

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusCopy(status: string) {
  if (status === 'ACTIVE') return 'In cover';
  if (status === 'CLAIMED') return 'A claim is in progress';
  if (status === 'EXPIRED') return 'Cover has ended';
  if (status === 'VOID') return 'No longer valid';
  if (status === 'OPEN') return 'Received — the shop will call you';
  if (status === 'IN_PROGRESS') return 'Being looked at';
  if (status === 'RESOLVED') return 'Resolved';
  if (status === 'REJECTED') return 'Declined';
  return status;
}

export default function WarrantyPage() {
  const [serial, setSerial] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [looking, setLooking] = useState(false);
  const [sending, setSending] = useState(false);

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitted(false);
    setCoverage(null);
    setLooking(true);
    try {
      const row = await api<Coverage>(
        `/v1/warranties/lookup?serial=${encodeURIComponent(serial.trim())}&phone=${encodeURIComponent(phone.trim())}`,
      );
      setCoverage(row);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No warranty found for that serial and phone');
    } finally {
      setLooking(false);
    }
  }

  async function claim(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSending(true);
    try {
      await api('/v1/warranties/claims', {
        method: 'POST',
        body: JSON.stringify({ serial, phone, description }),
      });
      setSubmitted(true);
      setCoverage((current) =>
        current
          ? {
              ...current,
              status: 'CLAIMED',
              canClaim: false,
              openClaim: {
                id: 'new',
                status: 'OPEN',
                description,
                createdAt: new Date().toISOString(),
              },
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the claim');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <p className="section-kicker">After sales</p>
      <h1 className="section-title">Warranty claim</h1>
      <p className="section-lede">
        Enter the serial on the unit and the phone number given at purchase. If cover is still valid you can describe the
        fault here — the Sylhet showroom will call you.
      </p>

      <form onSubmit={lookup} className="card mt-8 space-y-4 p-6">
        <label className="block text-sm font-medium">
          Serial number
          <input
            className="field mt-1"
            required
            minLength={3}
            value={serial}
            onChange={(e) => {
              setSerial(e.target.value.toUpperCase());
              setCoverage(null);
              setSubmitted(false);
            }}
            autoComplete="off"
            placeholder="Printed on the rating plate"
          />
        </label>
        <label className="block text-sm font-medium">
          Phone used at purchase
          <input
            className="field mt-1"
            required
            inputMode="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setCoverage(null);
              setSubmitted(false);
            }}
          />
        </label>
        {error && !coverage ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="btn-primary" disabled={looking}>
          {looking ? 'Looking up…' : 'Check cover'}
        </button>
      </form>

      {coverage ? (
        <section className="card mt-6 space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{coverage.product.name}</h2>
              <p className="mt-1 text-sm text-slate-500">Serial {coverage.serial}</p>
            </div>
            <p className="text-sm font-semibold text-[var(--color-primary)]">{statusCopy(coverage.status)}</p>
          </div>
          <p className="text-sm text-slate-600">
            Cover {formatDay(coverage.startDate)} – {formatDay(coverage.endDate)}
          </p>
          {coverage.openClaim ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {statusCopy(coverage.openClaim.status)}. Keep this phone nearby — staff will call to arrange a visit or
              parts.
            </p>
          ) : null}
          {submitted ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Claim received. We will call this number from the showroom.
            </p>
          ) : null}
          {coverage.canClaim ? (
            <form onSubmit={claim} className="space-y-3 border-t border-slate-100 pt-4">
              <label className="block text-sm font-medium">
                What is wrong?
                <textarea
                  className="field mt-1"
                  rows={4}
                  required
                  minLength={10}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="When it started, what you see or hear, and whether it is installed."
                />
              </label>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button className="btn-primary" disabled={sending}>
                {sending ? 'Sending…' : 'Send claim'}
              </button>
            </form>
          ) : null}
        </section>
      ) : null}

      <p className="mt-8 text-sm text-slate-500">
        Unused boxed goods may still be exchanged within 7 days.{' '}
        <Link href="/returns" className="font-semibold text-[var(--color-primary)]">
          Return and exchange
        </Link>
      </p>
    </main>
  );
}
