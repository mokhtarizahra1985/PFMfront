import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import {
  applyApiFieldErrors,
  getFormErrorMessage,
} from '@/utils/errors';
import { AppToast } from '@/components/shared/AppToast';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await login(values);
      navigate('/app/dashboard');
    } catch (error) {
      const mapped = applyApiFieldErrors<LoginFormValues>(error, setError);
      if (!mapped) {
        setFormError(getFormErrorMessage(error));
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">ورود</h2>
      <p className="mt-1 text-sm text-slate-600">
        با حساب خود وارد شوید.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            autoComplete="current-password"
            className="field-input"
            {...register('password')}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
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
          {isSubmitting ? 'در حال ورود...' : 'ورود'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        حساب ندارید؟{' '}
        <Link to="/auth/register" className="font-medium text-primary-600 hover:underline">
          ثبت‌نام
        </Link>
      </p>
    </div>
  );
}
