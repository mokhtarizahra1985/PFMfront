import { z } from 'zod';
import { parseMoneyInput } from '@/utils/money';

const frequencyEnum = z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']);

export const recurringFormSchema = z
  .object({
    title: z.string().min(1, 'عنوان الزامی است.').max(200, 'عنوان حداکثر ۲۰۰ کاراکتر است.'),
    amountInput: z
      .string()
      .min(1, 'مبلغ الزامی است.')
      .refine((value) => {
        const parsed = parseMoneyInput(value);
        return Number.isFinite(parsed) && parsed > 0;
      }, 'مبلغ باید بیشتر از صفر باشد.'),
    accountId: z.string().min(1, 'انتخاب حساب الزامی است.'),
    categoryId: z.string().min(1, 'انتخاب دسته الزامی است.'),
    frequency: frequencyEnum,
    startDate: z.string().min(1, 'تاریخ شروع الزامی است.'),
    endDate: z.string().optional(),
    note: z.string().max(500).optional(),
  })
  .refine(
    (data) => !data.endDate || data.endDate >= data.startDate,
    {
      message: 'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.',
      path: ['endDate'],
    },
  );

export type RecurringFormValues = z.infer<typeof recurringFormSchema>;

export const updateRecurringFormSchema = recurringFormSchema;

export type UpdateRecurringFormValues = RecurringFormValues;
