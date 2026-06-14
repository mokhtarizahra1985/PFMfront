import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schema';
import {
  applyApiFieldErrors,
  getFormErrorMessage,
} from '@/utils/errors';
import { AppToast } from '@/components/shared/AppToast';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      await registerUser({
        firstName: values.firstName,
        email: values.email,
        password: values.password,
      });
      navigate('/app/dashboard');
    } catch (error) {
      const mapped = applyApiFieldErrors<RegisterFormValues>(error, setError);
      if (!mapped) {
        setFormError(getFormErrorMessage(error));
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">ثبت‌نام</h2>
      <p className="mt-1 text-sm text-slate-600">
        حساب جدید بسازید و مدیریت مالی را شروع کنید.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-700">
            نام
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            className="field-input"
            {...register('firstName')}
          />
          {errors.firstName ? (
            <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            ایمیل
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="field-input"
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
            رمز عبور
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="field-input"
            {...register('password')}
          />
          <p className="mt-1 text-xs text-slate-500">حداقل ۸ کاراکتر</p>
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            تکرار رمز عبور
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="field-input"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        {formError ? (
          <AppToast message={formError} variant="error" />
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        قبلاً ثبت‌نام کرده‌اید؟{' '}
        <Link to="/auth/login" className="font-medium text-primary-600 hover:underline">
          ورود
        </Link>
      </p>
    </div>
  );
}
