import { z } from 'zod';

const categoryTypeEnum = z.enum(['INCOME', 'EXPENSE']);

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'نام دسته الزامی است.')
    .max(100, 'نام دسته حداکثر ۱۰۰ کاراکتر است.'),
  type: categoryTypeEnum,
  icon: z.string().max(10, 'آیکون معتبر نیست.').optional(),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'نام دسته الزامی است.')
    .max(100, 'نام دسته حداکثر ۱۰۰ کاراکتر است.'),
  icon: z.string().max(10, 'آیکون معتبر نیست.').optional(),
});

export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;
