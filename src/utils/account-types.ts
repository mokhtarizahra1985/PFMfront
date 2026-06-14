import type { AccountType } from '@/types/api.types';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CASH: 'پول نقد',
  BANK_ACCOUNT: 'حساب بانکی',
  BANK_CARD: 'کارت بانکی',
  DIGITAL_WALLET: 'کیف پول دیجیتال',
};

export const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'CASH', label: ACCOUNT_TYPE_LABELS.CASH },
  { value: 'BANK_ACCOUNT', label: ACCOUNT_TYPE_LABELS.BANK_ACCOUNT },
  { value: 'BANK_CARD', label: ACCOUNT_TYPE_LABELS.BANK_CARD },
  { value: 'DIGITAL_WALLET', label: ACCOUNT_TYPE_LABELS.DIGITAL_WALLET },
];

export function getAccountTypeLabel(type: AccountType): string {
  return ACCOUNT_TYPE_LABELS[type];
}
