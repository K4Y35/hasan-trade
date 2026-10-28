import type { ReactNode } from 'react';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{hint}</span> : null}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}
