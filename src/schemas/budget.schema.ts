import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'انتخاب دسته الزامی است.'),
  limitAmountInput: z
    .string()
    .min(1, 'سقف بودجه الزامی است.')
    .refine((value) => {
      const normalized = value.replace(/[^\d]/g, '');
      return normalized.length > 0 && Number(normalized) > 0;
    }, 'سقف بودجه باید بیشتر از صفر باشد.'),
});

export type CreateBudgetFormValues = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = z.object({
  limitAmountInput: z
    .string()
    .min(1, 'سقف بودجه الزامی است.')
    .refine((value) => {
      const normalized = value.replace(/[^\d]/g, '');
      return normalized.length > 0 && Number(normalized) > 0;
    }, 'سقف بودجه باید بیشتر از صفر باشد.'),
});

export type UpdateBudgetFormValues = z.infer<typeof updateBudgetSchema>;
