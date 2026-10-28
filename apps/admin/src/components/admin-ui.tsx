'use client';

import { AlertCircle, CheckCircle2, Loader2, Search } from 'lucide-react';
import type { ReactNode } from 'react';

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  onSubmit,
  submitLabel = 'Search',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  onSubmit?: () => void;
  submitLabel?: string;
}) {
  const field = (
    <label className="relative min-w-0 flex-1">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </label>
  );

  if (!onSubmit) return field;

  return (
    <form
      className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {field}
      <button className="primary shrink-0">{submitLabel}</button>
    </form>
  );
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  size?: 'md' | 'lg';
}) {
  return (
    <div className={`seg ${size === 'lg' ? 'seg-lg' : ''}`} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          className={value === option.id ? 'is-active' : ''}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ErrorBanner({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div role="alert" className="notice notice-danger">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500" role="status" aria-live="polite">
      <Loader2 size={16} className="admin-spin" />
      {label}
    </div>
  );
}

export function PaginationBar({
  page,
  perPage,
  total,
  onPage,
  noun = 'results',
}: {
  page: number;
  perPage: number;
  total: number;
  onPage: (page: number) => void;
  noun?: string;
}) {
  if (total <= 0) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
      <p>
        Showing {from}–{to} of {total} {noun}
      </p>
      {total > perPage ? (
        <div className="flex gap-2">
          <button type="button" className="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            Previous
          </button>
          <button type="button" className="ghost" disabled={page * perPage >= total} onClick={() => onPage(page + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function StickySaveBar({
  saving,
  saved,
  error,
  label,
  disabled,
  onSave,
}: {
  saving: boolean;
  saved?: string | boolean;
  error?: string;
  label: string;
  disabled?: boolean;
  onSave?: () => void;
}) {
  return (
    <div className="sticky bottom-4 z-10 space-y-2">
      <ErrorBanner>{error}</ErrorBanner>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <button type={onSave ? 'button' : 'submit'} className="primary" disabled={saving || disabled} onClick={onSave}>
          {saving ? 'Saving…' : label}
        </button>
        {saved ? (
          <span role="status" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={16} />
            {typeof saved === 'string' ? saved : 'Saved'}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="toolbar">{children}</div>;
}

export function TableCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card overflow-x-auto ${className}`}>{children}</div>;
}

export function SectionCard({
  title,
  hint,
  children,
  id,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="card scroll-mt-8 space-y-5 p-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Notice({
  tone = 'warn',
  children,
}: {
  tone?: 'warn' | 'ok' | 'danger';
  children: ReactNode;
}) {
  return <div className={`notice notice-${tone}`}>{children}</div>;
}
