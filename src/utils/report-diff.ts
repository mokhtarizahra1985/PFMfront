export function formatPercentChange(current: number, previous: number): string {
  if (previous === 0) {
    return current === 0 ? '۰٪' : '—';
  }

  const change = Math.round(((current - previous) / previous) * 100);
  if (change > 0) return `+${change}٪`;
  if (change < 0) return `${change}٪`;
  return '۰٪';
}

export function formatDifferenceLabel(difference: number): string {
  if (difference > 0) return 'افزایش';
  if (difference < 0) return 'کاهش';
  return 'بدون تغییر';
}
