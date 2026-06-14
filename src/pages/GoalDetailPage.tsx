import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, type FieldValues, type Path, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { GoalContribution, GoalStatus } from '@/types/api.types';
import {
  useContributionMutations,
  useGoal,
  useGoalContributions,
  useGoalMutations,
  useGoalProgress,
} from '@/hooks/useGoals';
import { useMoney } from '@/hooks/useMoney';
import {
  contributionSchema,
  updateGoalSchema,
  type ContributionFormValues,
  type UpdateGoalFormValues,
} from '@/schemas/goal.schema';
import {
  applyApiFieldErrors,
  getFormErrorMessage,
} from '@/utils/errors';
import { parseMoneyInput } from '@/utils/money';
import { formatDisplayDate, todayIsoDate } from '@/utils/date';
import { getGoalStatusConfig } from '@/utils/goal-status';
import { PageHeader } from '@/components/shared/PageHeader';
import { MoneyText } from '@/components/shared/MoneyText';
import { FormJalaliDateField } from '@/components/shared/FormJalaliDateField';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { AppToast } from '@/components/shared/AppToast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

type ModalMode = 'edit' | 'contribution' | 'editContribution' | null;

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toRialFromInput, toDisplayValue, unitLabel } = useMoney();

  const { data: goal, isLoading: goalLoading, isError: goalError, refetch } = useGoal(id);
  const { data: progress } = useGoalProgress(id);
  const { data: contributions, isLoading: contributionsLoading } = useGoalContributions(id);
  const { updateMutation, deleteMutation } = useGoalMutations();
  const { createMutation, updateMutation: updateContributionMutation, deleteMutation: deleteContributionMutation } =
    useContributionMutations(id ?? '');

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingContribution, setEditingContribution] = useState<GoalContribution | null>(null);
  const [pendingDeleteGoal, setPendingDeleteGoal] = useState(false);
  const [pendingDeleteContribution, setPendingDeleteContribution] =
    useState<GoalContribution | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const editForm = useForm<UpdateGoalFormValues>({
    resolver: zodResolver(updateGoalSchema),
    defaultValues: {
      title: '',
      targetAmountInput: '',
      targetDate: '',
      note: '',
    },
  });

  const contributionForm = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amountInput: '',
      contributionDate: todayIsoDate(),
      note: '',
    },
  });

  const openEditModal = () => {
    if (!goal) return;
    setFormError(null);
    editForm.reset({
      title: goal.title,
      targetAmountInput: String(toDisplayValue(goal.targetAmount)),
      targetDate: goal.targetDate ?? '',
      note: goal.note ?? '',
    });
    setModalMode('edit');
  };

  const openContributionModal = () => {
    setFormError(null);
    contributionForm.reset({
      amountInput: '',
      contributionDate: todayIsoDate(),
      note: '',
    });
    setModalMode('contribution');
  };

  const openEditContributionModal = (contribution: GoalContribution) => {
    setFormError(null);
    setEditingContribution(contribution);
    contributionForm.reset({
      amountInput: String(toDisplayValue(contribution.amount)),
      contributionDate: contribution.contributionDate,
      note: contribution.note ?? '',
    });
    setModalMode('editContribution');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingContribution(null);
    setFormError(null);
  };

  useEffect(() => {
    if (searchParams.get('action') !== 'contribute' || !goal || goal.status !== 'ACTIVE') {
      return;
    }

    setFormError(null);
    contributionForm.reset({
      amountInput: '',
      contributionDate: todayIsoDate(),
      note: '',
    });
    setModalMode('contribution');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('action');
        return next;
      },
      { replace: true },
    );
  }, [contributionForm, goal, searchParams, setSearchParams]);

  const onEditSubmit = async (values: UpdateGoalFormValues) => {
    if (!id) return;
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        id,
        input: {
          title: values.title,
          targetAmount: toRialFromInput(parseMoneyInput(values.targetAmountInput)),
          targetDate: values.targetDate || undefined,
          note: values.note || undefined,
        },
      });
      setSuccessMessage('هدف به‌روزرسانی شد.');
      closeModal();
    } catch (error) {
      const mapped = applyApiFieldErrors<UpdateGoalFormValues>(error, editForm.setError);
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const onContributionSubmit = async (values: ContributionFormValues) => {
    if (!id) return;
    setFormError(null);
    try {
      const input = {
        amount: toRialFromInput(parseMoneyInput(values.amountInput)),
        contributionDate: values.contributionDate,
        note: values.note || undefined,
      };

      if (modalMode === 'editContribution' && editingContribution) {
        await updateContributionMutation.mutateAsync({
          contributionId: editingContribution.id,
          input,
        });
        setSuccessMessage('واریز به‌روزرسانی شد.');
      } else {
        await createMutation.mutateAsync(input);
        setSuccessMessage('واریز ثبت شد.');
      }
      closeModal();
    } catch (error) {
      const mapped = applyApiFieldErrors<ContributionFormValues>(
        error,
        contributionForm.setError,
      );
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const handleStatusChange = async (status: GoalStatus) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id, input: { status } });
      setSuccessMessage('وضعیت هدف به‌روزرسانی شد.');
    } catch (error) {
      setFormError(getFormErrorMessage(error));
    }
  };

  const handleDeleteGoal = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/app/goals');
    } catch (error) {
      setFormError(getFormErrorMessage(error));
      setPendingDeleteGoal(false);
    }
  };

  const handleDeleteContribution = async () => {
    if (!pendingDeleteContribution) return;
    try {
      await deleteContributionMutation.mutateAsync(pendingDeleteContribution.id);
      setSuccessMessage('واریز حذف شد.');
      setPendingDeleteContribution(null);
    } catch (error) {
      setFormError(getFormErrorMessage(error));
      setPendingDeleteContribution(null);
    }
  };

  if (goalLoading) {
    return (
      <div>
        <PageHeader title="جزئیات هدف" description="در حال بارگذاری..." />
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (goalError || !goal || !progress) {
    return (
      <div>
        <PageHeader title="جزئیات هدف" description="خطا در بارگذاری هدف" />
        <ErrorState message="هدف یافت نشد یا بارگذاری با خطا مواجه شد." onRetry={() => void refetch()} />
      </div>
    );
  }

  const statusConfig = getGoalStatusConfig(progress.status);
  const progressWidth = Math.min(progress.percentage, 100);
  const canContribute = goal.status === 'ACTIVE';

  return (
    <div>
      <PageHeader
        title={goal.title}
        description={goal.category}
        actions={
          <div className="flex flex-wrap gap-2">
            {canContribute ? (
              <button
                type="button"
                onClick={openContributionModal}
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                ثبت واریز
              </button>
            ) : null}
            <Link
              to="/app/goals"
              className="rounded-xl border border-slate-200/70 px-4 py-2 text-sm hover:bg-surface"
            >
              بازگشت
            </Link>
          </div>
        }
      />

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

      <section className="surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
            <p className="mt-3 text-3xl font-bold text-primary-600">{progress.percentage}٪</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canContribute ? (
              <button
                type="button"
                onClick={openContributionModal}
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                ثبت واریز
              </button>
            ) : null}
            <button
              type="button"
              onClick={openEditModal}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
            >
              ویرایش
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={progress.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`پیشرفت ${goal.title}`}
        >
          <div
            className="h-full rounded-full bg-primary-500 transition-all"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-500">پس‌انداز شده</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              <MoneyText amount={progress.savedAmount} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">مانده تا هدف</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              <MoneyText amount={progress.remainingAmount} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">مبلغ هدف</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              <MoneyText amount={progress.targetAmount} />
            </dd>
          </div>
        </dl>

        {goal.targetDate ? (
          <p className="mt-4 text-sm text-slate-500">
            تاریخ هدف: {formatDisplayDate(goal.targetDate)}
          </p>
        ) : null}
        {goal.note ? (
          <p className="mt-2 text-sm text-slate-600">{goal.note}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {goal.status === 'ACTIVE' ? (
            <button
              type="button"
              onClick={() => void handleStatusChange('PAUSED')}
              className="rounded-lg px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50"
            >
              توقف هدف
            </button>
          ) : null}
          {goal.status === 'PAUSED' ? (
            <button
              type="button"
              onClick={() => void handleStatusChange('ACTIVE')}
              className="rounded-lg px-3 py-1.5 text-xs text-green-700 hover:bg-green-50"
            >
              فعال‌سازی مجدد
            </button>
          ) : null}
          {goal.status !== 'CANCELLED' && goal.status !== 'COMPLETED' ? (
            <button
              type="button"
              onClick={() => void handleStatusChange('CANCELLED')}
              className="rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              لغو هدف
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setPendingDeleteGoal(true)}
            className="rounded-lg px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
          >
            حذف هدف
          </button>
        </div>
      </section>

      <section className="surface-card mt-6 p-6">
        <h2 className="text-base font-semibold text-slate-900">تاریخچه واریزها</h2>
        {contributionsLoading ? <LoadingSkeleton variant="table" /> : null}
        {!contributionsLoading && contributions?.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200/80 bg-surface/60 p-4 text-center">
            <p className="text-sm text-slate-600">هنوز واریزی ثبت نشده است.</p>
            {canContribute ? (
              <button
                type="button"
                onClick={openContributionModal}
                className="mt-3 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                اولین واریز را ثبت کنید
              </button>
            ) : null}
          </div>
        ) : null}
        {!contributionsLoading && contributions && contributions.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {contributions.map((contribution) => (
              <li
                key={contribution.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    <MoneyText amount={contribution.amount} />
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDisplayDate(contribution.contributionDate)}
                    {contribution.note ? ` · ${contribution.note}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditContributionModal(contribution)}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteContribution(contribution)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {modalMode === 'edit' ? (
        <DetailModal
          title="ویرایش هدف"
          onClose={closeModal}
          onSubmit={editForm.handleSubmit(onEditSubmit)}
          formError={formError}
          isSubmitting={editForm.formState.isSubmitting || updateMutation.isPending}
        >
          <DetailFormField label="عنوان" id="edit-title" name="title" register={editForm.register} error={editForm.formState.errors.title?.message} />
          <DetailFormField label={`مبلغ هدف (${unitLabel})`} id="edit-amount" name="targetAmountInput" inputMode="numeric" register={editForm.register} error={editForm.formState.errors.targetAmountInput?.message} />
          <FormJalaliDateField label="تاریخ هدف" id="edit-date" name="targetDate" control={editForm.control} error={editForm.formState.errors.targetDate?.message} />
          <DetailFormField label="یادداشت" id="edit-note" name="note" register={editForm.register} error={editForm.formState.errors.note?.message} />
        </DetailModal>
      ) : null}

      {modalMode === 'contribution' || modalMode === 'editContribution' ? (
        <DetailModal
          title={modalMode === 'editContribution' ? 'ویرایش واریز' : 'ثبت واریز جدید'}
          onClose={closeModal}
          onSubmit={contributionForm.handleSubmit(onContributionSubmit)}
          formError={formError}
          isSubmitting={
            contributionForm.formState.isSubmitting ||
            createMutation.isPending ||
            updateContributionMutation.isPending
          }
        >
          <DetailFormField label={`مبلغ (${unitLabel})`} id="contrib-amount" name="amountInput" inputMode="numeric" register={contributionForm.register} error={contributionForm.formState.errors.amountInput?.message} />
          <FormJalaliDateField label="تاریخ" id="contrib-date" name="contributionDate" control={contributionForm.control} error={contributionForm.formState.errors.contributionDate?.message} />
          <DetailFormField label="یادداشت (اختیاری)" id="contrib-note" name="note" register={contributionForm.register} error={contributionForm.formState.errors.note?.message} />
        </DetailModal>
      ) : null}

      <ConfirmDialog
        open={pendingDeleteGoal}
        title="حذف هدف"
        message="آیا از حذف این هدف و تمام واریزهای آن مطمئن هستید؟"
        confirmLabel="حذف"
        isLoading={deleteMutation.isPending}
        onConfirm={() => void handleDeleteGoal()}
        onCancel={() => setPendingDeleteGoal(false)}
      />

      <ConfirmDialog
        open={Boolean(pendingDeleteContribution)}
        title="حذف واریز"
        message="آیا از حذف این واریز مطمئن هستید؟"
        confirmLabel="حذف"
        isLoading={deleteContributionMutation.isPending}
        onConfirm={() => void handleDeleteContribution()}
        onCancel={() => setPendingDeleteContribution(null)}
      />
    </div>
  );
}

function DetailModal({
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
      <button type="button" aria-label="بستن" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="modal-panel w-full max-w-md">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
          {children}
          {formError ? <AppToast message={formError} variant="error" /> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
              انصراف
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60">
              {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailFormField<TFieldValues extends FieldValues>({
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
