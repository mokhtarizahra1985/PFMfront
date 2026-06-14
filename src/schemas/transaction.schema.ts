import { z } from 'zod';
import { parseMoneyInput } from '@/utils/money';

export const transactionFormSchema = z.object({
  title: z
    .string()
    .min(1, 'عنوان الزامی است.')
    .max(200, 'عنوان حداکثر ۲۰۰ کاراکتر است.'),
  amountInput: z
    .string()
    .min(1, 'مبلغ الزامی است.')
    .refine((value) => {
      const parsed = parseMoneyInput(value);
      return Number.isFinite(parsed) && parsed > 0;
    }, 'مبلغ باید بیشتر از صفر باشد.'),
  accountId: z.string().min(1, 'انتخاب حساب الزامی است.'),
  categoryId: z.string().min(1, 'انتخاب دسته الزامی است.'),
  transactionDate: z.string().min(1, 'تاریخ الزامی است.'),
  note: z.string().max(500, 'یادداشت حداکثر ۵۰۰ کاراکتر است.').optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export const transferFormSchema = z
  .object({
    sourceAccountId: z.string().min(1, 'حساب مبدا الزامی است.'),
    destinationAccountId: z.string().min(1, 'حساب مقصد الزامی است.'),
    amountInput: z
      .string()
      .min(1, 'مبلغ الزامی است.')
      .refine((value) => {
        const parsed = parseMoneyInput(value);
        return Number.isFinite(parsed) && parsed > 0;
      }, 'مبلغ باید بیشتر از صفر باشد.'),
    transferDate: z.string().min(1, 'تاریخ الزامی است.'),
    note: z.string().max(500).optional(),
  })
  .refine((data) => data.sourceAccountId !== data.destinationAccountId, {
    message: 'حساب مبدا و مقصد نمی‌توانند یکسان باشند.',
    path: ['destinationAccountId'],
  });

export type TransferFormValues = z.infer<typeof transferFormSchema>;
