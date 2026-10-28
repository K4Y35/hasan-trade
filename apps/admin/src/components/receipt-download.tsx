'use client';

import { Download } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { downloadFile } from '@/lib/api';

export function ReceiptDownload({
  orderId,
  orderNumber,
  variant = 'ghost',
  compact = false,
}: {
  orderId: string;
  orderNumber: string;
  variant?: 'ghost' | 'primary';
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setBusy(true);
    setError('');
    try {
      await downloadFile(`/v1/orders/${orderId}/receipt`, `${orderNumber}-receipt.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download receipt');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        className={variant === 'primary' ? 'primary' : 'ghost'}
        onClick={onClick}
        disabled={busy}
        aria-label={`Download PDF receipt for ${orderNumber}`}
      >
        <Download size={16} />
        {busy ? 'Preparing…' : compact ? 'PDF' : 'Download receipt'}
      </button>
      {error ? (
        <span role="status" className="text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </span>
  );
}
