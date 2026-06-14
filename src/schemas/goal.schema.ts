import { z } from 'zod';

const positiveAmountInput = z
  .string()
  .min(1, 'مبلغ الزامی است.')
  .refine((value) => {
    const normalized = value.replace(/[^\d]/g, '');
    return normalized.length > 0 && Number(normalized) > 0;
  }, 'مبلغ باید بیشتر از صفر باشد.');

export const createGoalSchema = z.object({
  title: z
    .string()
    .min(1, 'عنوان هدف الزامی است.')
    .max(200, 'عنوان حداکثر ۲۰۰ کاراکتر است.'),
  category: z
    .string()
    .min(1, 'نوع هدف الزامی است.')
    .max(100, 'نوع هدف حداکثر ۱۰۰ کاراکتر است.'),
  targetAmountInput: positiveAmountInput,
  targetDate: z.string().optional(),
  note: z.string().max(500, 'یادداشت حداکثر ۵۰۰ کاراکتر است.').optional(),
});

export type CreateGoalFormValues = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z.object({
  title: z
    .string()
    .min(1, 'عنوان هدف الزامی است.')
    .max(200, 'عنوان حداکثر ۲۰۰ کاراکتر است.'),
  targetAmountInput: positiveAmountInput,
  targetDate: z.string().optional(),
  note: z.string().max(500, 'یادداشت حداکثر ۵۰۰ کاراکتر است.').optional(),
});

export type UpdateGoalFormValues = z.infer<typeof updateGoalSchema>;

export const contributionSchema = z.object({
  amountInput: positiveAmountInput,
  contributionDate: z.string().min(1, 'تاریخ واریز الزامی است.'),
  note: z.string().max(500, 'یادداشت حداکثر ۵۰۰ کاراکتر است.').optional(),
});

export type ContributionFormValues = z.infer<typeof contributionSchema>;
