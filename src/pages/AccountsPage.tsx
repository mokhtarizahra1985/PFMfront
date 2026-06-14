import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Account } from '@/types/api.types';
import { useAccountMutations, useAccounts } from '@/hooks/useAccounts';
import { useMoney } from '@/hooks/useMoney';
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountFormValues,
  type UpdateAccountFormValues,
} from '@/schemas/account.schema';
import { ACCOUNT_TYPE_OPTIONS } from '@/utils/account-types';
import {
  applyApiFieldErrors,
  getFormErrorMessage,
} from '@/utils/errors';
import { parseMoneyInput } from '@/utils/money';
import { PageHeader } from '@/components/shared/PageHeader';
import { AccountCard } from '@/components/shared/AccountCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { AppToast } from '@/components/shared/AppToast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

type ModalMode = 'create' | 'edit' | null;

export function AccountsPage() {
  const { data: accounts, isLoading, isError, refetch } = useAccounts();
  const { createMutation, updateMutation, deactivateMutation } =
    useAccountMutations();
  const { toRialFromInput, unitLabel } = useMoney();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deactivatingAccount, setDeactivatingAccount] = useState<Account | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createForm = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      type: 'BANK_ACCOUNT',
      initialBalanceInput: '',
    },
  });

  const editForm = useForm<UpdateAccountFormValues>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      name: '',
      type: 'BANK_ACCOUNT',
    },
  });

  useEffect(() => {
    if (modalMode === 'edit' && editingAccount) {
      editForm.reset({
        name: editingAccount.name,
        type: editingAccount.type,
      });
    }
  }, [modalMode, editingAccount, editForm]);

  const openCreateModal = () => {
    setFormError(null);
    createForm.reset({
      name: '',
      type: 'BANK_ACCOUNT',
      initialBalanceInput: '',
    });
    setModalMode('create');
  };

  const openEditModal = (account: Account) => {
    setFormError(null);
    setEditingAccount(account);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingAccount(null);
    setFormError(null);
  };

  const onCreateSubmit = async (values: CreateAccountFormValues) => {
    setFormError(null);
    try {
      const raw = values.initialBalanceInput?.trim();
      const initialBalance =
        raw && raw !== ''
          ? toRialFromInput(parseMoneyInput(raw))
          : 0;

      await createMutation.mutateAsync({
        name: values.name,
        type: values.type,
        initialBalance,
      });

      setSuccessMessage('حساب با موفقیت ایجاد شد.');
      closeModal();
    } catch (error) {
      const mapped = applyApiFieldErrors<CreateAccountFormValues>(
        error,
        createForm.setError,
      );
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const onEditSubmit = async (values: UpdateAccountFormValues) => {
    if (!editingAccount) return;
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        id: editingAccount.id,
        input: values,
      });
      setSuccessMessage('حساب با موفقیت به‌روزرسانی شد.');
      closeModal();
    } catch (error) {
      const mapped = applyApiFieldErrors<UpdateAccountFormValues>(
        error,
        editForm.setError,
      );
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingAccount) return;
    try {
      await deactivateMutation.mutateAsync(deactivatingAccount.id);
      setSuccessMessage('حساب غیرفعال شد.');
      setDeactivatingAccount(null);
    } catch (error) {
      setFormError(getFormErrorMessage(error));
      setDeactivatingAccount(null);
    }
  };

  if (isLoading) return <LoadingSkeleton variant="page" />;

  if (isError) {
    return (
      <ErrorState
        message="بارگذاری حساب‌ها با خطا مواجه شد."
        onRetry={() => void refetch()}
      />
    );
  }

  const activeAccounts = accounts?.filter((a) => a.isActive === true) ?? [];
  const inactiveAccounts = accounts?.filter((a) => !a.isActive) ?? [];

  return (
    <div>
      <PageHeader
        title="حساب‌ها"
        description="حساب‌های بانکی، نقدی و دیجیتال خود را مدیریت کنید."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            + حساب جدید
          </button>
        }
      />

      {successMessage ? (
        <div className="mb-4">
          <AppToast message={successMessage} />
        </div>
      ) : null}
      {formError && !modalMode ? (
        <div className="mb-4">
          <AppToast message={formError} variant="error" />
        </div>
      ) : null}

      {activeAccounts.length === 0 && (accounts?.length ?? 0) > 0 ? (
        <div className="mb-4">
          <AppToast
            message="هیچ حساب فعالی ندارید. برای ثبت تراکنش، حساب جدید بسازید یا حساب غیرفعال را ویرایش کنید."
            variant="error"
          />
        </div>
      ) : null}

      {!accounts?.length ? (
        <EmptyState
          title="هنوز حسابی ثبت نشده"
          description="اولین حساب خود را بسازید تا تراکنش‌ها را ثبت کنید."
          action={
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              ساخت حساب
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          {activeAccounts.length === 0 && inactiveAccounts.length === 0 ? (
            <EmptyState
              title="حسابی برای نمایش نیست"
              description="داده حساب‌ها نامعتبر است. صفحه را رفرش کنید یا دوباره تلاش کنید."
              action={
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white"
                >
                  تلاش دوباره
                </button>
              }
            />
          ) : null}

          {activeAccounts.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
                حساب‌های فعال
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activeAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={openEditModal}
                    onDeactivate={setDeactivatingAccount}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {inactiveAccounts.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
                حساب‌های غیرفعال
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {inactiveAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={openEditModal}
                    onDeactivate={setDeactivatingAccount}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}

      {modalMode === 'create' ? (
        <AccountFormModal
          title="حساب جدید"
          onClose={closeModal}
          onSubmit={createForm.handleSubmit(onCreateSubmit)}
          formError={formError}
          isSubmitting={createForm.formState.isSubmitting || createMutation.isPending}
        >
          <AccountFormFields
            register={createForm.register}
            errors={createForm.formState.errors}
            showInitialBalance
            unitLabel={unitLabel}
          />
        </AccountFormModal>
      ) : null}

      {modalMode === 'edit' && editingAccount ? (
        <AccountFormModal
          title="ویرایش حساب"
          onClose={closeModal}
          onSubmit={editForm.handleSubmit(onEditSubmit)}
          formError={formError}
          isSubmitting={editForm.formState.isSubmitting || updateMutation.isPending}
        >
          <AccountFormFields
            register={editForm.register}
            errors={editForm.formState.errors}
          />
        </AccountFormModal>
      ) : null}

      <ConfirmDialog
        open={Boolean(deactivatingAccount)}
        title="غیرفعال‌سازی حساب"
        message={`آیا از غیرفعال کردن «${deactivatingAccount?.name}» مطمئن هستید؟ تاریخچه تراکنش‌ها حفظ می‌شود.`}
        confirmLabel="غیرفعال کن"
        isLoading={deactivateMutation.isPending}
        onConfirm={() => void handleDeactivate()}
        onCancel={() => setDeactivatingAccount(null)}
      />
    </div>
  );
}

function AccountFormModal({
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

function AccountFormFields({
  register,
  errors,
  showInitialBalance,
  unitLabel,
}: {
  register: ReturnType<typeof useForm<CreateAccountFormValues>>['register'];
  errors: Record<string, { message?: string } | undefined>;
  showInitialBalance?: boolean;
  unitLabel?: string;
}) {
  return (
    <>
      <div>
        <label htmlFor="account-name" className="mb-2 block text-sm font-medium text-slate-700">
          نام حساب
        </label>
        <input
          id="account-name"
          className="field-input"
          {...register('name')}
        />
        {errors.name?.message ? (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="account-type" className="mb-2 block text-sm font-medium text-slate-700">
          نوع حساب
        </label>
        <select
          id="account-type"
          className="field-input"
          {...register('type')}
        >
          {ACCOUNT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.type?.message ? (
          <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>
        ) : null}
      </div>

      {showInitialBalance ? (
        <div>
          <label
            htmlFor="initial-balance"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            موجودی اولیه ({unitLabel})
          </label>
          <input
            id="initial-balance"
            inputMode="numeric"
            placeholder="۰"
            className="field-input"
            {...register('initialBalanceInput')}
          />
          {errors.initialBalanceInput?.message ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.initialBalanceInput.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
