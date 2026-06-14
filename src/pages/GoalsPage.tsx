import type { ReactNode } from 'react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { GoalStatus } from '@/types/api.types';
import { useGoalMutations, useGoals } from '@/hooks/useGoals';
import { useMoney } from '@/hooks/useMoney';
import {
  createGoalSchema,
  type CreateGoalFormValues,
} from '@/schemas/goal.schema';
import {
  applyApiFieldErrors,
  getFormErrorMessage,
} from '@/utils/errors';
import { parseMoneyInput } from '@/utils/money';
import { PageHeader } from '@/components/shared/PageHeader';
import { GoalCard } from '@/components/goals/GoalCard';
import { FormJalaliDateField } from '@/components/shared/FormJalaliDateField';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { AppToast } from '@/components/shared/AppToast';

type StatusFilter = GoalStatus | 'ALL';

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'همه' },
  { id: 'ACTIVE', label: 'فعال' },
  { id: 'COMPLETED', label: 'تکمیل‌شده' },
  { id: 'PAUSED', label: 'متوقف' },
  { id: 'CANCELLED', label: 'لغوشده' },
];

const GOAL_CATEGORY_SUGGESTIONS = ['خرید', 'سفر', 'آموزش', 'پس‌انداز اضطراری', 'خانه'];

export function GoalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = (searchParams.get('status') as StatusFilter) || 'ALL';
  const statusQuery = statusFilter === 'ALL' ? undefined : statusFilter;

  const { data: goals, isLoading, isError, refetch } = useGoals(statusQuery);
  const { createMutation } = useGoalMutations();
  const { toRialFromInput, unitLabel } = useMoney();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<CreateGoalFormValues>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: '',
      category: '',
      targetAmountInput: '',
      targetDate: '',
      note: '',
    },
  });

  const setStatusFilter = (next: StatusFilter) => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        if (next === 'ALL') {
          nextParams.delete('status');
        } else {
          nextParams.set('status', next);
        }
        return nextParams;
      },
      { replace: true },
    );
  };

  const openCreateModal = () => {
    setFormError(null);
    form.reset({
      title: '',
      category: '',
      targetAmountInput: '',
      targetDate: '',
      note: '',
    });
    setShowCreateModal(true);
  };

  const onCreateSubmit = async (values: CreateGoalFormValues) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync({
        title: values.title,
        category: values.category,
        targetAmount: toRialFromInput(parseMoneyInput(values.targetAmountInput)),
        targetDate: values.targetDate || undefined,
        note: values.note || undefined,
      });
      setSuccessMessage('هدف با موفقیت ایجاد شد.');
      setShowCreateModal(false);
    } catch (error) {
      const mapped = applyApiFieldErrors<CreateGoalFormValues>(error, form.setError);
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  return (
    <div>
      <PageHeader
        title="اهداف پس‌انداز"
        description="هدف بسازید و با «ثبت واریز» مبلغ پس‌انداز را به‌روز کنید."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            ساخت هدف
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={[
              'rounded-xl px-3 py-2 text-sm font-medium transition',
              statusFilter === tab.id
                ? 'bg-primary-600 text-white'
                : 'border border-slate-200/70 bg-surface-elevated/90 text-slate-600 hover:bg-surface',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {successMessage ? (
        <div className="mb-4">
          <AppToast message={successMessage} variant="success" />
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : null}

      {isError ? (
        <ErrorState
          message="بارگذاری اهداف با خطا مواجه شد."
          onRetry={() => void refetch()}
        />
      ) : null}

      {!isLoading && !isError && goals?.length === 0 ? (
        <EmptyState
          title="هنوز هدفی ثبت نشده"
          description="یک هدف پس‌انداز بسازید و با ثبت واریزها پیشرفت خود را دنبال کنید."
          action={
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              ساخت اولین هدف
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && goals && goals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : null}

      {showCreateModal ? (
        <GoalFormModal
          title="ساخت هدف جدید"
          onClose={() => setShowCreateModal(false)}
          onSubmit={form.handleSubmit(onCreateSubmit)}
          formError={formError}
          isSubmitting={form.formState.isSubmitting || createMutation.isPending}
        >
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
            مبلغ هدف به ریال ثبت می‌شود. در نسخه‌های بعدی امکان تطبیق با بازار اضافه
            خواهد شد.
          </p>
          <GoalFormField
            label="عنوان هدف"
            id="goal-title"
            name="title"
            register={form.register}
            error={form.formState.errors.title?.message}
          />
          <div>
            <label htmlFor="goal-category" className="mb-2 block text-sm font-medium text-slate-700">
              نوع هدف
            </label>
            <input
              id="goal-category"
              list="goal-category-suggestions"
              className="field-input"
              placeholder="مثلاً خرید لپ‌تاپ"
              {...form.register('category')}
            />
            <datalist id="goal-category-suggestions">
              {GOAL_CATEGORY_SUGGESTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            {form.formState.errors.category?.message ? (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.category.message}
              </p>
            ) : null}
          </div>
          <GoalFormField
            label={`مبلغ هدف (${unitLabel})`}
            id="goal-target-amount"
            name="targetAmountInput"
            inputMode="numeric"
            register={form.register}
            error={form.formState.errors.targetAmountInput?.message}
          />
          <FormJalaliDateField
            label="تاریخ هدف (اختیاری)"
            id="goal-target-date"
            name="targetDate"
            control={form.control}
            error={form.formState.errors.targetDate?.message}
          />
          <GoalFormField
            label="یادداشت (اختیاری)"
            id="goal-note"
            name="note"
            register={form.register}
            error={form.formState.errors.note?.message}
          />
        </GoalFormModal>
      ) : null}
    </div>
  );
}

function GoalFormModal({
  title,
  onClose,
  onSubmit,
  formError,
  isSubmitting,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  formError: string | null;
  isSubmitting: boolean;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="modal-panel max-h-[90vh] w-full max-w-md overflow-y-auto">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
          {children}
          {formError ? <AppToast message={formError} variant="error" /> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GoalFormField({
  label,
  id,
  name,
  register,
  error,
  type = 'text',
  inputMode,
}: {
  label: string;
  id: string;
  name: keyof CreateGoalFormValues;
  register: UseFormRegister<CreateGoalFormValues>;
  error?: string;
  type?: string;
  inputMode?: 'numeric' | 'text';
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        className="field-input"
        {...register(name)}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
