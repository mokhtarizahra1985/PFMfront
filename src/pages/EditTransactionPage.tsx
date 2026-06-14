import { useEffect, useState, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActiveAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useMoney } from '@/hooks/useMoney';
import { useTransaction, useTransactionMutations } from '@/hooks/useTransactions';
import {
  transactionFormSchema,
  type TransactionFormValues,
} from '@/schemas/transaction.schema';
import {
  applyApiFieldErrors,
  getFormErrorMessage,
} from '@/utils/errors';
import { parseMoneyInput } from '@/utils/money';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { AppToast } from '@/components/shared/AppToast';
import { FormJalaliDateField } from '@/components/shared/FormJalaliDateField';

export function EditTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: transaction, isLoading, isError, refetch } = useTransaction(id);
  const { updateMutation } = useTransactionMutations();
  const { data: accounts } = useActiveAccounts();
  const { data: expenseCategories } = useCategories('EXPENSE');
  const { data: incomeCategories } = useCategories('INCOME');
  const { toRialFromInput, toDisplayValue, unitLabel } = useMoney();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: '',
      amountInput: '',
      accountId: '',
      categoryId: '',
      transactionDate: '',
      note: '',
    },
  });

  useEffect(() => {
    if (!transaction) return;
    form.reset({
      title: transaction.title,
      amountInput: String(toDisplayValue(transaction.amount)),
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      transactionDate: transaction.transactionDate,
      note: transaction.note ?? '',
    });
  }, [transaction, form, toDisplayValue]);

  const categories =
    transaction?.type === 'INCOME' ? incomeCategories : expenseCategories;

  const onSubmit = async (values: TransactionFormValues) => {
    if (!id) return;
    setFormError(null);

    try {
      await updateMutation.mutateAsync({
        id,
        input: {
          title: values.title,
          amount: toRialFromInput(parseMoneyInput(values.amountInput)),
          accountId: values.accountId,
          categoryId: values.categoryId,
          transactionDate: values.transactionDate,
          note: values.note || undefined,
        },
      });
      navigate('/app/transactions');
    } catch (error) {
      const mapped = applyApiFieldErrors<TransactionFormValues>(error, form.setError);
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  if (isLoading) return <LoadingSkeleton variant="page" />;

  if (isError || !transaction) {
    return (
      <ErrorState
        message="بارگذاری تراکنش با خطا مواجه شد."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="ویرایش تراکنش"
        description={transaction.type === 'INCOME' ? 'درآمد' : 'هزینه'}
      />

      <div className="surface-card max-w-xl p-6">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Field
            label="عنوان"
            id="edit-title"
            error={form.formState.errors.title?.message}
            {...form.register('title')}
          />
          <Field
            label={`مبلغ (${unitLabel})`}
            id="edit-amount"
            inputMode="numeric"
            error={form.formState.errors.amountInput?.message}
            {...form.register('amountInput')}
          />
          <SelectField
            label="حساب"
            id="edit-account"
            error={form.formState.errors.accountId?.message}
            options={accounts?.map((a) => ({ value: a.id, label: a.name })) ?? []}
            {...form.register('accountId')}
          />
          <SelectField
            label="دسته"
            id="edit-category"
            error={form.formState.errors.categoryId?.message}
            options={
              categories?.map((c) => ({
                value: c.id,
                label: `${c.icon} ${c.name}`,
              })) ?? []
            }
            {...form.register('categoryId')}
          />
          <FormJalaliDateField
            label="تاریخ"
            id="edit-date"
            name="transactionDate"
            control={form.control}
            error={form.formState.errors.transactionDate?.message}
          />
          <Field
            label="یادداشت"
            id="edit-note"
            error={form.formState.errors.note?.message}
            {...form.register('note')}
          />

          {formError ? <AppToast message={formError} variant="error" /> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Link
              to="/app/transactions"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
            >
              انصراف
            </Link>
            <button
              type="submit"
              disabled={form.formState.isSubmitting || updateMutation.isPending}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {updateMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  error,
  type = 'text',
  inputMode,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
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
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  id,
  error,
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        className="field-input"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
