import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settings.api';
import { useSettings } from '@/hooks/useSettings';
import { settingsSchema, type SettingsFormValues } from '@/schemas/auth.schema';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { AppToast } from '@/components/shared/AppToast';
import { getFormErrorMessage } from '@/utils/errors';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useSettings();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      currencyDisplay: 'TOMAN',
    },
  });

  useEffect(() => {
    if (data) {
      reset({ currencyDisplay: data.currencyDisplay });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated);
      setSuccessMessage('تنظیمات با موفقیت ذخیره شد.');
      setFormError(null);
    },
    onError: (error) => {
      setFormError(getFormErrorMessage(error));
      setSuccessMessage(null);
    },
  });

  const onSubmit = async (values: SettingsFormValues) => {
    setSuccessMessage(null);
    setFormError(null);
    await updateMutation.mutateAsync(values);
  };

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="بارگذاری تنظیمات با خطا مواجه شد."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="تنظیمات"
        description="نحوه نمایش مبالغ و ترجیحات کاربری را مدیریت کنید."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="surface-card max-w-xl p-6"
      >
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-slate-900">
            نمایش واحد پول
          </legend>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-surface/60 p-4">
            <input type="radio" value="TOMAN" {...register('currencyDisplay')} />
            <span>
              <span className="block text-sm font-medium text-slate-900">تومان</span>
              <span className="text-xs text-slate-500">
                مبالغ با تقسیم بر ۱۰ نمایش داده می‌شوند.
              </span>
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-surface/60 p-4">
            <input type="radio" value="RIAL" {...register('currencyDisplay')} />
            <span>
              <span className="block text-sm font-medium text-slate-900">ریال</span>
              <span className="text-xs text-slate-500">
                مبالغ دقیقاً همان‌طور که از سرور می‌آید نمایش داده می‌شوند.
              </span>
            </span>
          </label>
        </fieldset>

        {successMessage ? <div className="mt-4"><AppToast message={successMessage} /></div> : null}
        {formError ? <div className="mt-4"><AppToast message={formError} variant="error" /></div> : null}

        <button
          type="submit"
          disabled={isSubmitting || updateMutation.isPending}
          className="mt-6 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isSubmitting || updateMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </button>
      </form>
    </div>
  );
}
