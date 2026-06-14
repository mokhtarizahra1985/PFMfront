import type { RecurringFrequency } from '@/types/api.types';

export const FREQUENCY_OPTIONS: { value: RecurringFrequency; label: string }[] = [
  { value: 'WEEKLY', label: 'هفتگی' },
  { value: 'MONTHLY', label: 'ماهانه' },
  { value: 'YEARLY', label: 'سالانه' },
];

export function getFrequencyLabel(frequency: RecurringFrequency): string {
  return FREQUENCY_OPTIONS.find((item) => item.value === frequency)?.label ?? frequency;
}
