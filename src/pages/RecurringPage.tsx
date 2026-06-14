import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CategoryType, RecurringTransaction } from '@/types/api.types';
import { useActiveAccounts } from '@/hooks/useAccounts';
import { useActiveCategories } from '@/hooks/useCategories';
import { useRecurring, useRecurringMutations } from '@/hooks/useRecurring';
import { useMoney } from '@/hooks/useMoney';
import {
  recurringFormSchema,
  type RecurringFormValues,
} from '@/schemas/recurring.schema';
import {
  applyApiFieldErrors,
  getFormErrorMessage,
} from '@/utils/errors';
import { parseMoneyInput } from '@/utils/money';
import { todayIsoDate } from '@/utils/date';
import { FREQUENCY_OPTIONS } from '@/utils/recurring-labels';
import { PageHeader } from '@/components/shared/PageHeader';
import { RecurringCard } from '@/components/recurring/RecurringCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { AppToast } from '@/components/shared/AppToast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FormJalaliDateField } from '@/components/shared/FormJalaliDateField';

type TabType = CategoryType;
type ModalMode = 'create' | 'edit' | null;

const TABS: { type: TabType; label: string }[] = [
  { type: 'INCOME', label: 'درآمد ثابت' },
  { type: 'EXPENSE', label: 'هزینه ثابت' },
];

export function RecurringPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('type') as TabType) || 'INCOME';

  const { data: items, isLoading, isError, refetch } = useRecurring(activeTab);
  const { data: accounts } = useActiveAccounts();
  const { data: categories } = useActiveCategories(activeTab);
  const { createMutation, updateMutation, deleteMutation, toggleActiveMutation } =
    useRecurringMutations();
  const { toRialFromInput, toDisplayValue, unitLabel } = useMoney();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
  const [deletingItem, setDeletingItem] = useState<RecurringTransaction | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: {
      title: '',
      amountInput: '',
      accountId: '',
      categoryId: '',
      frequency: 'MONTHLY',
      startDate: todayIsoDate(),
      endDate: '',
      note: '',
    },
  });

  useEffect(() => {
    if (modalMode === 'edit' && editingItem) {
      form.reset({
        title: editingItem.title,
        amountInput: String(toDisplayValue(editingItem.amount)),
        accountId: editingItem.accountId,
        categoryId: editingItem.categoryId,
        frequency: editingItem.frequency,
        startDate: editingItem.startDate,
        endDate: editingItem.endDate ?? '',
        note: editingItem.note ?? '',
      });
    }
  }, [modalMode, editingItem, form, toDisplayValue]);

  const setActiveTab = (type: TabType) => {
    setSearchParams({ type }, { replace: true });
  };

  const openCreateModal = () => {
    setFormError(null);
    form.reset({
      title: activeTab === 'INCOME' ? 'حقوق ماهانه' : '',
      amountInput: '',
      accountId: accounts?.[0]?.id ?? '',
      categoryId: categories?.[0]?.id ?? '',
      frequency: 'MONTHLY',
      startDate: todayIsoDate(),
      endDate: '',
      note: '',
    });
    setModalMode('create');
  };

  const openEditModal = (item: RecurringTransaction) => {
    setFormError(null);
    setEditingItem(item);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingItem(null);
    setFormError(null);
  };

  const buildPayload = (values: RecurringFormValues) => ({
    title: values.title,
    amount: toRialFromInput(parseMoneyInput(values.amountInput)),
    accountId: values.accountId,
    categoryId: values.categoryId,
    frequency: values.frequency,
    startDate: values.startDate,
    endDate: values.endDate || undefined,
    note: values.note || undefined,
  });

  const onCreateSubmit = async (values: RecurringFormValues) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync({
        ...buildPayload(values),
        type: activeTab,
      });
      setSuccessMessage('مورد ثابت با موفقیت ایجاد شد.');
      closeModal();
    } catch (error) {
      const mapped = applyApiFieldErrors<RecurringFormValues>(error, form.setError);
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const onEditSubmit = async (values: RecurringFormValues) => {
    if (!editingItem) return;
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        input: buildPayload(values),
      });
      setSuccessMessage('مورد ثابت به‌روزرسانی شد.');
      closeModal();
    } catch (error) {
      const mapped = applyApiFieldErrors<RecurringFormValues>(error, form.setError);
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const handleToggleActive = async (item: RecurringTransaction) => {
    try {
      await toggleActiveMutation.mutateAsync({
        id: item.id,
        isActive: !item.isActive,
      });
      setSuccessMessage(item.isActive ? 'مورد ثابت متوقف شد.' : 'مورد ثابت فعال شد.');
    } catch (error) {
      setFormError(getFormErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      setSuccessMessage('مورد ثابت حذف شد.');
      setDeletingItem(null);
    } catch (error) {
      setFormError(getFormErrorMessage(error));
      setDeletingItem(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="درآمد و هزینه ثابت"
        description="حقوق، اجاره، قسط و سایر موارد تکرارشونده — مبلغ قابل ویرایش، با تاریخ شروع و پایان."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            {activeTab === 'INCOME' ? 'درآمد ثابت جدید' : 'هزینه ثابت جدید'}
          </button>
        }
      />

      <div className="surface-segment mb-6 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActiveTab(tab.type)}
            className={[
              'flex-1 rounded-xl px-3 py-2 text-sm font-medium transition',
              activeTab === tab.type
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 hover:bg-surface',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="mb-4 rounded-xl bg-primary-50/80 px-4 py-3 text-xs text-slate-600">
        در سررسید هر مورد، تراکنش مربوط به‌صورت خودکار ساخته می‌شود. برای اقساط وام،
        تاریخ پایان را وارد کنید.
      </p>

      {successMessage ? (
        <div className="mb-4">
          <AppToast message={successMessage} variant="success" />
        </div>
      ) : null}
      {formError && !modalMode ? (
        <div className="mb-4">
          <AppToast message={formError} variant="error" />
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : null}

      {isError ? (
        <ErrorState
          message="بارگذاری موارد ثابت با خطا مواجه شد."
          onRetry={() => void refetch()}
        />
      ) : null}

      {!isLoading && !isError && items?.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'INCOME'
              ? 'درآمد ثابتی تعریف نشده'
              : 'هزینه ثابتی تعریف نشده'
          }
          description={
            activeTab === 'INCOME'
              ? 'حقوق ماهانه یا سایر درآمدهای تکرارشونده را یک‌بار ثبت کنید.'
              : 'اجاره، قسط، شارژ ساختمان و سایر هزینه‌های تکرارشونده را ثبت کنید.'
          }
          action={
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              افزودن مورد
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && items && items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <RecurringCard
              key={item.id}
              item={item}
              onEdit={openEditModal}
              onToggleActive={handleToggleActive}
              onDelete={setDeletingItem}
            />
          ))}
        </div>
      ) : null}

      {modalMode ? (
        <RecurringFormModal
          title={
            modalMode === 'create'
              ? activeTab === 'INCOME'
                ? 'درآمد ثابت جدید'
                : 'هزینه ثابت جدید'
              : 'ویرایش مورد ثابت'
          }
          onClose={closeModal}
          onSubmit={form.handleSubmit(
            modalMode === 'create' ? onCreateSubmit : onEditSubmit,
          )}
          formError={formError}
          isSubmitting={
            form.formState.isSubmitting ||
            createMutation.isPending ||
            updateMutation.isPending
          }
        >
          <RecurringFormFields
            form={form}
            accounts={accounts ?? []}
            categories={categories ?? []}
            unitLabel={unitLabel}
          />
        </RecurringFormModal>
      ) : null}

      <ConfirmDialog
        open={Boolean(deletingItem)}
        title="حذف مورد ثابت"
        message={`آیا از حذف «${deletingItem?.title}» مطمئن هستید؟ تراکنش‌های قبلی حذف نمی‌شوند.`}
        confirmLabel="حذف"
        isLoading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
}

function RecurringFormModal({
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
      <div className="modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
          {children}
          {formError ? <AppToast message={formError} variant="error" /> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-surface"
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

function RecurringFormFields({
  form,
  accounts,
  categories,
  unitLabel,
}: {
  form: ReturnType<typeof useForm<RecurringFormValues>>;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; icon?: string }[];
  unitLabel: string;
}) {
  const { register, control, formState: { errors } } = form;

  return (
    <>
      <div>
        <label htmlFor="recurring-title" className="mb-2 block text-sm font-medium text-slate-700">
          عنوان
        </label>
        <input id="recurring-title" className="field-input" {...register('title')} />
        {errors.title?.message ? (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="recurring-amount" className="mb-2 block text-sm font-medium text-slate-700">
          مبلغ ({unitLabel})
        </label>
        <input
          id="recurring-amount"
          inputMode="numeric"
          className="field-input"
          {...register('amountInput')}
        />
        {errors.amountInput?.message ? (
          <p className="mt-1 text-xs text-red-600">{errors.amountInput.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="recurring-account" className="mb-2 block text-sm font-medium text-slate-700">
          حساب
        </label>
        <select id="recurring-account" className="field-input" {...register('accountId')}>
          <option value="">انتخاب کنید</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        {errors.accountId?.message ? (
          <p className="mt-1 text-xs text-red-600">{errors.accountId.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="recurring-category" className="mb-2 block text-sm font-medium text-slate-700">
          دسته
        </label>
        <select id="recurring-category" className="field-input" {...register('categoryId')}>
          <option value="">انتخاب کنید</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId?.message ? (
          <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="recurring-frequency" className="mb-2 block text-sm font-medium text-slate-700">
          دوره تکرار
        </label>
        <select id="recurring-frequency" className="field-input" {...register('frequency')}>
          {FREQUENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormJalaliDateField
          label="تاریخ شروع"
          id="recurring-start"
          name="startDate"
          control={control}
          error={errors.startDate?.message}
        />
        <FormJalaliDateField
          label="تاریخ پایان (اختیاری)"
          id="recurring-end"
          name="endDate"
          control={control}
          error={errors.endDate?.message}
        />
      </div>

      <div>
        <label htmlFor="recurring-note" className="mb-2 block text-sm font-medium text-slate-700">
          یادداشت (اختیاری)
        </label>
        <input id="recurring-note" className="field-input" {...register('note')} />
      </div>
    </>
  );
}
