import type { ReactNode } from 'react';

export function PageHeader({
  kicker,
  title,
  lede,
  action,
}: {
  kicker: string;
  title: string;
  lede?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="page-kicker">{kicker}</p>
        <h1 className="page-title">{title}</h1>
        {lede ? <p className="page-lede max-w-2xl">{lede}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}
