import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'ایمیل الزامی است.')
    .email('ایمیل معتبر نیست.'),
  password: z.string().min(1, 'رمز عبور الزامی است.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'نام باید حداقل ۲ کاراکتر باشد.')
      .max(50, 'نام حداکثر ۵۰ کاراکتر است.'),
    email: z
      .string()
      .min(1, 'ایمیل الزامی است.')
      .email('ایمیل معتبر نیست.'),
    password: z
      .string()
      .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد.'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const settingsSchema = z.object({
  currencyDisplay: z.enum(['RIAL', 'TOMAN']),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
