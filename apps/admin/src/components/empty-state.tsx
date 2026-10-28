import type { LucideIcon } from 'lucide-react';
import { Package } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  title,
  hint,
  action,
  icon: Icon = Package,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
        <Icon size={22} aria-hidden />
      </span>
      <p className="mt-4 font-medium text-slate-800">{title}</p>
      {hint ? <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">{hint}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
