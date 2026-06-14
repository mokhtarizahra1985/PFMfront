import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, type FieldValues, type Path, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActiveAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useMoney } from '@/hooks/useMoney';
import {
  useTransactionMutations,
  useTransferMutations,
} from '@/hooks/useTransactions';
import {
  transactionFormSchema,
  transferFormSchema,
  type TransactionFormValues,
  type TransferFormValues,
} from '@/schemas/transaction.schema';
import {
  applyApiFieldErrors,
  getFormErrorMessage,
} from '@/utils/errors';
import { parseMoneyInput } from '@/utils/money';
import { todayIsoDate } from '@/utils/date';
import { PageHeader } from '@/components/shared/PageHeader';
import { AppToast } from '@/components/shared/AppToast';
import { FormJalaliDateField } from '@/components/shared/FormJalaliDateField';
import { MoneyText } from '@/components/shared/MoneyText';
import type { TransactionType } from '@/types/api.types';

type FormMode = 'expense' | 'income' | 'transfer';

const FORM_TABS: { id: FormMode; label: string; href: string }[] = [
  { id: 'expense', label: 'هزینه', href: '/app/transactions/new?type=expense' },
  { id: 'income', label: 'درآمد', href: '/app/transactions/new?type=income' },
  { id: 'transfer', label: 'انتقال', href: '/app/transactions/new?type=transfer' },
];

export function NewTransactionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('type') as FormMode) || 'expense';
  const [formError, setFormError] = useState<string | null>(null);

  const { toRialFromInput, unitLabel } = useMoney();
  const { data: accounts } = useActiveAccounts();
  const { data: expenseCategories } = useCategories('EXPENSE');
  const { data: incomeCategories } = useCategories('INCOME');
  const { createMutation } = useTransactionMutations();
  const { createMutation: createTransferMutation } = useTransferMutations();

  const transactionForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: '',
      amountInput: '',
      accountId: '',
      categoryId: '',
      transactionDate: todayIsoDate(),
      note: '',
    },
  });

  const transferForm = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      sourceAccountId: '',
      destinationAccountId: '',
      amountInput: '',
      transferDate: todayIsoDate(),
      note: '',
    },
  });

  const sourceAccountId = transferForm.watch('sourceAccountId');
  const sourceAccount = useMemo(
    () => accounts?.find((account) => account.id === sourceAccountId),
    [accounts, sourceAccountId],
  );

  useEffect(() => {
    if (!accounts?.length) return;

    transactionForm.reset({
      title: '',
      amountInput: '',
      accountId: accounts[0].id,
      categoryId: transactionForm.getValues('categoryId') || '',
      transactionDate: todayIsoDate(),
      note: '',
    });

    transferForm.reset({
      sourceAccountId: accounts[0].id,
      destinationAccountId: accounts[1]?.id ?? accounts[0].id,
      amountInput: '',
      transferDate: todayIsoDate(),
      note: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, accounts]);

  useEffect(() => {
    const categories = mode === 'income' ? incomeCategories : expenseCategories;
    const defaultCategoryId = categories?.[0]?.id;
    if (!defaultCategoryId) return;

    transactionForm.setValue('categoryId', defaultCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, incomeCategories, expenseCategories]);

  const onSubmitTransaction = async (values: TransactionFormValues) => {
    setFormError(null);
    const type: TransactionType = mode === 'income' ? 'INCOME' : 'EXPENSE';

    try {
      await createMutation.mutateAsync({
        type,
        title: values.title,
        amount: toRialFromInput(parseMoneyInput(values.amountInput)),
        accountId: values.accountId,
        categoryId: values.categoryId,
        transactionDate: values.transactionDate,
        note: values.note || undefined,
      });
      navigate('/app/transactions');
    } catch (error) {
      const mapped = applyApiFieldErrors<TransactionFormValues>(
        error,
        transactionForm.setError,
      );
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const onSubmitTransfer = async (values: TransferFormValues) => {
    setFormError(null);
    try {
      await createTransferMutation.mutateAsync({
        sourceAccountId: values.sourceAccountId,
        destinationAccountId: values.destinationAccountId,
        amount: toRialFromInput(parseMoneyInput(values.amountInput)),
        transferDate: values.transferDate,
        note: values.note || undefined,
      });
      navigate('/app/transactions?activityType=TRANSFER');
    } catch (error) {
      const mapped = applyApiFieldErrors<TransferFormValues>(
        error,
        transferForm.setError,
      );
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const categories = mode === 'income' ? incomeCategories : expenseCategories;
  const isSubmitting =
    createMutation.isPending || createTransferMutation.isPending;

  return (
    <div>
      <PageHeader
        title="ثبت فعالیت جدید"
        description="هزینه، درآمد یا انتقال بین حساب‌ها را ثبت کنید."
      />

      <div className="mb-6 flex gap-2 surface-segment">
        {FORM_TABS.map((tab) => (
          <Link
            key={tab.id}
            to={tab.href}
            className={[
              'flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-medium transition',
              mode === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 hover:bg-slate-50',
            ].join(' ')}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="surface-card max-w-xl p-6">
        {accounts && accounts.length < 2 ? (
          <AppToast
            message="برای انتقال وجه حداقل دو حساب فعال لازم است."
            variant="error"
          />
        ) : null}
        {mode === 'transfer' ? (
          <form
            className="space-y-4"
            onSubmit={transferForm.handleSubmit(onSubmitTransfer)}
            noValidate
          >
            <FormSelect
              label="حساب مبدا"
              id="sourceAccountId"
              name="sourceAccountId"
              register={transferForm.register}
              error={transferForm.formState.errors.sourceAccountId?.message}
              options={accounts?.map((a) => ({ value: a.id, label: a.name })) ?? []}
            />
            {sourceAccount ? (
              <p className="text-sm text-slate-600">
                موجودی مبدا: <MoneyText amount={sourceAccount.balance} />
              </p>
            ) : null}
            <FormSelect
              label="حساب مقصد"
              id="destinationAccountId"
              name="destinationAccountId"
              register={transferForm.register}
              error={transferForm.formState.errors.destinationAccountId?.message}
              options={accounts?.map((a) => ({ value: a.id, label: a.name })) ?? []}
            />
            <FormInput
              label={`مبلغ (${unitLabel})`}
              id="transfer-amount"
              name="amountInput"
              inputMode="numeric"
              register={transferForm.register}
              error={transferForm.formState.errors.amountInput?.message}
            />
            <FormJalaliDateField
              label="تاریخ"
              id="transfer-date"
              name="transferDate"
              control={transferForm.control}
              error={transferForm.formState.errors.transferDate?.message}
            />
            <FormInput
              label="یادداشت (اختیاری)"
              id="transfer-note"
              name="note"
              register={transferForm.register}
              error={transferForm.formState.errors.note?.message}
            />
            {formError ? <AppToast message={formError} variant="error" /> : null}
            <SubmitRow isSubmitting={isSubmitting} cancelTo="/app/transactions" />
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={transactionForm.handleSubmit(onSubmitTransaction)}
            noValidate
          >
            <FormInput
              label="عنوان"
              id="title"
              name="title"
              register={transactionForm.register}
              error={transactionForm.formState.errors.title?.message}
            />
            <FormInput
              label={`مبلغ (${unitLabel})`}
              id="amount"
              name="amountInput"
              inputMode="numeric"
              register={transactionForm.register}
              error={transactionForm.formState.errors.amountInput?.message}
            />
            <FormSelect
              label={mode === 'income' ? 'حساب مقصد' : 'حساب'}
              id="accountId"
              name="accountId"
              register={transactionForm.register}
              error={transactionForm.formState.errors.accountId?.message}
              options={accounts?.map((a) => ({ value: a.id, label: a.name })) ?? []}
            />
            <FormSelect
              label={mode === 'income' ? 'دسته درآمد' : 'دسته هزینه'}
              id="categoryId"
              name="categoryId"
              register={transactionForm.register}
              error={transactionForm.formState.errors.categoryId?.message}
              options={
                categories?.map((c) => ({
                  value: c.id,
                  label: `${c.icon} ${c.name}`,
                })) ?? []
              }
            />
            <FormJalaliDateField
              label="تاریخ"
              id="transaction-date"
              name="transactionDate"
              control={transactionForm.control}
              error={transactionForm.formState.errors.transactionDate?.message}
            />
            <FormInput
              label="یادداشت (اختیاری)"
              id="note"
              name="note"
              register={transactionForm.register}
              error={transactionForm.formState.errors.note?.message}
            />
            {formError ? <AppToast message={formError} variant="error" /> : null}
            <SubmitRow isSubmitting={isSubmitting} cancelTo="/app/transactions" />
          </form>
        )}
      </div>
    </div>
  );
}

function FormInput<TFieldValues extends FieldValues>({
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
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
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

function FormSelect<TFieldValues extends FieldValues>({
  label,
  id,
  name,
  register,
  error,
  options,
}: {
  label: string;
  id: string;
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
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
        {...register(name)}
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

function SubmitRow({
  isSubmitting,
  cancelTo,
}: {
  isSubmitting: boolean;
  cancelTo: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Link
        to={cancelTo}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
      >
        انصراف
      </Link>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
      </button>
    </div>
  );
}
