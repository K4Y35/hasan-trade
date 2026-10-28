const TONE: Record<string, string> = {
  PENDING: 'badge-warn',
  CONFIRMED: 'badge-info',
  PROCESSING: 'badge-info',
  SHIPPED: 'badge-info',
  DELIVERED: 'badge-ok',
  CANCELLED: 'badge-danger',
  REFUNDED: 'badge-danger',
  ACTIVE: 'badge-ok',
  DRAFT: 'badge-muted',
  ARCHIVED: 'badge-muted',
  COMPLETED: 'badge-ok',
  VOID: 'badge-danger',
  RETURNED: 'badge-warn',
  EXPIRED: 'badge-muted',
  CLAIMED: 'badge-warn',
  OPEN: 'badge-warn',
  IN_PROGRESS: 'badge-info',
  RESOLVED: 'badge-ok',
  REJECTED: 'badge-danger',
};

const LABEL: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  ARCHIVED: 'Hidden',
  COMPLETED: 'Completed',
  VOID: 'Void',
  RETURNED: 'Returned',
  EXPIRED: 'Expired',
  CLAIMED: 'Claim open',
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Declined',
};

export function statusLabel(value: string) {
  if (LABEL[value]) return LABEL[value];
  const spaced = value.replace(/_/g, ' ').toLowerCase();
  return spaced ? spaced.replace(/^\w/, (letter) => letter.toUpperCase()) : value;
}

export function StatusBadge({ value }: { value: string }) {
  return <span className={`badge ${TONE[value] ?? 'badge-muted'}`}>{statusLabel(value)}</span>;
}
