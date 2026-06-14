import type { CurrencyDisplay } from '@/types/api.types';

const UNIT_LABELS: Record<CurrencyDisplay, string> = {
  RIAL: 'ریال',
  TOMAN: 'تومان',
};

export function toDisplayValue(
  rialValue: number,
  unit: CurrencyDisplay,
): number {
  if (unit === 'TOMAN') {
    return Math.floor(rialValue / 10);
  }
  return rialValue;
}

export function toRialFromInput(
  inputValue: number,
  unit: CurrencyDisplay,
): number {
  if (unit === 'TOMAN') {
    return Math.round(inputValue * 10);
  }
  return Math.round(inputValue);
}

export function formatMoney(
  rialValue: number,
  unit: CurrencyDisplay,
): string {
  const displayValue = toDisplayValue(rialValue, unit);
  const formatted = displayValue.toLocaleString('fa-IR');
  return `${formatted} ${UNIT_LABELS[unit]}`;
}

export function getUnitLabel(unit: CurrencyDisplay): string {
  return UNIT_LABELS[unit];
}

export function parseMoneyInput(raw: string): number {
  const normalized = raw.replace(/[,،\s]/g, '');
  if (normalized === '') {
    return NaN;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}
