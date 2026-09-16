export function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatRelative(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const days = Math.max(0, Math.round((Date.now() - date.getTime()) / 86_400_000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
