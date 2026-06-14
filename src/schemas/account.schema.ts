import { z } from 'zod';
import { parseMoneyInput } from '@/utils/money';

const accountTypeEnum = z.enum([
  'CASH',
  'BANK_ACCOUNT',
  'BANK_CARD',
  'DIGITAL_WALLET',
]);

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'نام حساب الزامی است.')
    .max(100, 'نام حساب حداکثر ۱۰۰ کاراکتر است.'),
  type: accountTypeEnum,
  initialBalanceInput: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === '') return true;
        const parsed = parseMoneyInput(value);
        return Number.isFinite(parsed) && parsed >= 0;
      },
      { message: 'موجودی اولیه باید عدد معتبر و غیرمنفی باشد.' },
    ),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'نام حساب الزامی است.')
    .max(100, 'نام حساب حداکثر ۱۰۰ کاراکتر است.'),
  type: accountTypeEnum,
});

export type UpdateAccountFormValues = z.infer<typeof updateAccountSchema>;
