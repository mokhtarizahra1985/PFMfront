import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, type FieldValues, type Path, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Budget } from '@/types/api.types';
import { useActiveCategories } from '@/hooks/useCategories';
import { useBudgetMutations, useBudgets } from '@/hooks/useBudgets';
import { useMoney } from '@/hooks/useMoney';
import {
  createBudgetSchema,
  updateBudgetSchema,
  type CreateBudgetFormValues,
  type UpdateBudgetFormValues,
} from '@/schemas/budget.schema';
import {
  applyApiFieldErrors,
  getFormErrorMessage,
} from '@/utils/errors';
import { parseMoneyInput } from '@/utils/money';
import {
  currentMonthParam,
  formatMonthLabel,
  parseMonthParam,
  shiftMonth,
} from '@/utils/date';
import { PageHeader } from '@/components/shared/PageHeader';
import { BudgetCard } from '@/components/budget/BudgetCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { AppToast } from '@/components/shared/AppToast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

type ModalMode = 'create' | 'edit' | null;

export function BudgetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthParam = searchParams.get('month') ?? currentMonthParam();
  const { year, month } = parseMonthParam(monthParam);

  const { data: budgets, isLoading, isError, refetch } = useBudgets(year, month);
  const { data: expenseCategories } = useActiveCategories('EXPENSE');
  const { createMutation, updateMutation, deleteMutation } = useBudgetMutations();
  const { toRialFromInput, toDisplayValue, unitLabel } = useMoney();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createForm = useForm<CreateBudgetFormValues>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: { categoryId: '', limitAmountInput: '' },
  });

  const editForm = useForm<UpdateBudgetFormValues>({
    resolver: zodResolver(updateBudgetSchema),
    defaultValues: { limitAmountInput: '' },
  });

  const budgetedCategoryIds = useMemo(
    () => new Set(budgets?.map((item) => item.categoryId) ?? []),
    [budgets],
  );

  const unbudgetedCategories = useMemo(
    () =>
      expenseCategories?.filter((category) => !budgetedCategoryIds.has(category.id)) ?? [],
    [expenseCategories, budgetedCategoryIds],
  );

  const setMonth = (nextMonth: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextMonth === currentMonthParam()) {
          next.delete('month');
        } else {
          next.set('month', nextMonth);
        }
        return next;
      },
      { replace: true },
    );
  };

  const openCreateModal = (categoryId?: string) => {
    setFormError(null);
    createForm.reset({
      categoryId: categoryId ?? '',
      limitAmountInput: '',
    });
    setModalMode('create');
  };

  const openEditModal = (budget: Budget) => {
    setFormError(null);
    setEditingBudget(budget);
    editForm.reset({
      limitAmountInput: String(toDisplayValue(budget.limitAmount)),
    });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingBudget(null);
    setFormError(null);
  };

  const onCreateSubmit = async (values: CreateBudgetFormValues) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync({
        categoryId: values.categoryId,
        year,
        month,
        limitAmount: toRialFromInput(parseMoneyInput(values.limitAmountInput)),
      });
      setSuccessMessage('بودجه با موفقیت ثبت شد.');
      closeModal();
    } catch (error) {
      const mapped = applyApiFieldErrors<CreateBudgetFormValues>(
        error,
        createForm.setError,
      );
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const onEditSubmit = async (values: UpdateBudgetFormValues) => {
    if (!editingBudget) return;
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        id: editingBudget.id,
        input: {
          limitAmount: toRialFromInput(parseMoneyInput(values.limitAmountInput)),
        },
      });
      setSuccessMessage('سقف بودجه به‌روزرسانی شد.');
      closeModal();
    } catch (error) {
      const mapped = applyApiFieldErrors<UpdateBudgetFormValues>(
        error,
        editForm.setError,
      );
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deletingBudget) return;
    try {
      await deleteMutation.mutateAsync(deletingBudget.id);
      setSuccessMessage('بودجه حذف شد.');
      setDeletingBudget(null);
    } catch (error) {
      setSuccessMessage(null);
      setFormError(getFormErrorMessage(error));
      setDeletingBudget(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="بودجه ماهانه"
        description="برای هر دسته هزینه، سقف ماهانه تعیین کنید."
        actions={
          <button
            type="button"
            onClick={() => openCreateModal()}
            disabled={unbudgetedCategories.length === 0}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            افزودن بودجه
          </button>
        }
      />

      <div className="mb-6 flex items-center gap-2 surface-segment">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(monthParam, -1))}
          className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          aria-label="ماه قبل"
        >
          ‹
        </button>
        <span className="min-w-24 flex-1 text-center text-sm font-medium text-slate-900">
          {formatMonthLabel(monthParam)}
        </span>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(monthParam, 1))}
          className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          aria-label="ماه بعد"
        >
          ›
        </button>
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
          message="بارگذاری بودجه‌ها با خطا مواجه شد."
          onRetry={() => void refetch()}
        />
      ) : null}

      {!isLoading && !isError && budgets?.length === 0 ? (
        <EmptyState
          title="بودجه‌ای برای این ماه تعریف نشده"
          description="برای کنترل هزینه‌ها، برای دسته‌های پرمصرف خود سقف ماهانه تعیین کنید."
          action={
            unbudgetedCategories.length > 0 ? (
              <button
                type="button"
                onClick={() => openCreateModal()}
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                اولین بودجه را بسازید
              </button>
            ) : (
              <p className="text-sm text-slate-500">
                ابتدا یک دسته هزینه در بخش دسته‌بندی‌ها بسازید.
              </p>
            )
          }
        />
      ) : null}

      {!isLoading && !isError && budgets && budgets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={openEditModal}
              onDelete={setDeletingBudget}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && unbudgetedCategories.length > 0 ? (
        <section className="surface-card mt-8 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            دسته‌های بدون بودجه
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            برای این دسته‌ها هنوز سقف ماهانه تعریف نشده است.
          </p>
          <ul className="mt-4 space-y-2">
            {unbudgetedCategories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
              >
                <span className="text-sm text-slate-800">
                  {category.icon} {category.name}
                </span>
                <button
                  type="button"
                  onClick={() => openCreateModal(category.id)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  تعیین سقف
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {modalMode === 'create' ? (
        <BudgetFormModal
          title="افزودن بودجه"
          onClose={closeModal}
          onSubmit={createForm.handleSubmit(onCreateSubmit)}
          formError={formError}
          isSubmitting={createForm.formState.isSubmitting || createMutation.isPending}
        >
          <div>
            <label htmlFor="budget-category" className="mb-2 block text-sm font-medium text-slate-700">
              دسته هزینه
            </label>
            <select
              id="budget-category"
              className="field-input"
              {...createForm.register('categoryId')}
            >
              <option value="">انتخاب کنید</option>
              {unbudgetedCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {createForm.formState.errors.categoryId?.message ? (
              <p className="mt-1 text-xs text-red-600">
                {createForm.formState.errors.categoryId.message}
              </p>
            ) : null}
          </div>
          <LimitAmountField
            id="create-limit"
            register={createForm.register}
            error={createForm.formState.errors.limitAmountInput?.message}
            unitLabel={unitLabel}
          />
        </BudgetFormModal>
      ) : null}

      {modalMode === 'edit' && editingBudget ? (
        <BudgetFormModal
          title={`ویرایش بودجه — ${editingBudget.categoryName}`}
          onClose={closeModal}
          onSubmit={editForm.handleSubmit(onEditSubmit)}
          formError={formError}
          isSubmitting={editForm.formState.isSubmitting || updateMutation.isPending}
        >
          <LimitAmountField
            id="edit-limit"
            register={editForm.register}
            error={editForm.formState.errors.limitAmountInput?.message}
            unitLabel={unitLabel}
          />
        </BudgetFormModal>
      ) : null}

      <ConfirmDialog
        open={Boolean(deletingBudget)}
        title="حذف بودجه"
        message={`آیا از حذف بودجه «${deletingBudget?.categoryName}» برای ${formatMonthLabel(monthParam)} مطمئن هستید؟`}
        confirmLabel="حذف"
        isLoading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeletingBudget(null)}
      />
    </div>
  );
}

function BudgetFormModal({
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
      <div className="modal-panel w-full max-w-md">
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

function LimitAmountField<TFieldValues extends FieldValues & { limitAmountInput: string }>({
  id,
  register,
  error,
  unitLabel,
}: {
  id: string;
  register: UseFormRegister<TFieldValues>;
  error?: string;
  unitLabel: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        سقف بودجه ({unitLabel})
      </label>
      <input
        id={id}
        inputMode="numeric"
        placeholder="۰"
        className="field-input"
        {...register('limitAmountInput' as Path<TFieldValues>)}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
