import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useForm, type FieldValues, type Path, type PathValue, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Category, CategoryType } from '@/types/api.types';
import { useCategories, useCategoryMutations } from '@/hooks/useCategories';
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryFormValues,
  type UpdateCategoryFormValues,
} from '@/schemas/category.schema';
import {
  applyApiFieldErrors,
  getFormErrorMessage,
} from '@/utils/errors';
import { PageHeader } from '@/components/shared/PageHeader';
import { CategoryCard } from '@/components/shared/CategoryCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { AppToast } from '@/components/shared/AppToast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const CATEGORY_TABS: { type: CategoryType; label: string }[] = [
  { type: 'EXPENSE', label: 'دسته‌های هزینه' },
  { type: 'INCOME', label: 'دسته‌های درآمد' },
];

const ICON_SUGGESTIONS = ['🍔', '🚗', '🏠', '💡', '🛒', '💊', '📚', '🎬', '💰', '🎁', '📦'];

type ModalMode = 'create' | 'edit' | null;

export function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<CategoryType>('EXPENSE');
  const { data: categories, isLoading, isError, refetch } = useCategories(activeTab);
  const { createMutation, updateMutation, deactivateMutation } =
    useCategoryMutations(activeTab);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deactivatingCategory, setDeactivatingCategory] =
    useState<Category | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createForm = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      type: 'EXPENSE',
      icon: '📦',
    },
  });

  const editForm = useForm<UpdateCategoryFormValues>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: '',
      icon: '📦',
    },
  });

  useEffect(() => {
    createForm.setValue('type', activeTab);
  }, [activeTab, createForm]);

  useEffect(() => {
    if (modalMode === 'edit' && editingCategory) {
      editForm.reset({
        name: editingCategory.name,
        icon: editingCategory.icon || '📦',
      });
    }
  }, [modalMode, editingCategory, editForm]);

  const openCreateModal = () => {
    setFormError(null);
    createForm.reset({
      name: '',
      type: activeTab,
      icon: '📦',
    });
    setModalMode('create');
  };

  const openEditModal = (category: Category) => {
    setFormError(null);
    setEditingCategory(category);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingCategory(null);
    setFormError(null);
  };

  const onCreateSubmit = async (values: CreateCategoryFormValues) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync({
        name: values.name,
        type: values.type,
        icon: values.icon || '📦',
      });
      setSuccessMessage('دسته با موفقیت ایجاد شد.');
      closeModal();
    } catch (error) {
      const mapped = applyApiFieldErrors<CreateCategoryFormValues>(
        error,
        createForm.setError,
      );
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const onEditSubmit = async (values: UpdateCategoryFormValues) => {
    if (!editingCategory) return;
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        input: {
          name: values.name,
          icon: values.icon || '📦',
        },
      });
      setSuccessMessage('دسته با موفقیت به‌روزرسانی شد.');
      closeModal();
    } catch (error) {
      const mapped = applyApiFieldErrors<UpdateCategoryFormValues>(
        error,
        editForm.setError,
      );
      if (!mapped) setFormError(getFormErrorMessage(error));
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingCategory) return;
    try {
      await deactivateMutation.mutateAsync(deactivatingCategory.id);
      setSuccessMessage('دسته غیرفعال شد.');
      setDeactivatingCategory(null);
    } catch (error) {
      setFormError(getFormErrorMessage(error));
      setDeactivatingCategory(null);
    }
  };

  const activeCategories = categories?.filter((c) => c.isActive) ?? [];
  const inactiveCategories = categories?.filter((c) => !c.isActive) ?? [];

  return (
    <div>
      <PageHeader
        title="دسته‌بندی‌ها"
        description="دسته‌های درآمد و هزینه را مدیریت کنید."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            + دسته جدید
          </button>
        }
      />

      <div className="mb-6 flex gap-2 surface-segment">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActiveTab(tab.type)}
            className={[
              'flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition',
              activeTab === tab.type
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 hover:bg-slate-50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

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

      {isLoading ? (
        <LoadingSkeleton variant="table" />
      ) : isError ? (
        <ErrorState
          message="بارگذاری دسته‌ها با خطا مواجه شد."
          onRetry={() => void refetch()}
        />
      ) : !categories?.length ? (
        <EmptyState
          title="دسته‌ای یافت نشد"
          description="دسته سفارشی جدید بسازید یا از دسته‌های پیش‌فرض استفاده کنید."
          action={
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              ساخت دسته
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          {activeCategories.length > 0 ? (
            <section className="space-y-3">
              {activeCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={openEditModal}
                  onDeactivate={setDeactivatingCategory}
                />
              ))}
            </section>
          ) : (
            <EmptyState
              title="دسته فعالی وجود ندارد"
              description="یک دسته جدید بسازید."
              action={
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white"
                >
                  ساخت دسته
                </button>
              }
            />
          )}

          {inactiveCategories.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
                دسته‌های غیرفعال
              </h2>
              <div className="space-y-3">
                {inactiveCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={openEditModal}
                    onDeactivate={setDeactivatingCategory}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}

      {modalMode === 'create' ? (
        <CategoryFormModal
          title="دسته جدید"
          onClose={closeModal}
          onSubmit={createForm.handleSubmit(onCreateSubmit)}
          formError={formError}
          isSubmitting={createForm.formState.isSubmitting || createMutation.isPending}
        >
          <CategoryFormFields
            register={createForm.register}
            errors={createForm.formState.errors}
            setValue={createForm.setValue}
            watchIcon={createForm.watch('icon')}
          />
        </CategoryFormModal>
      ) : null}

      {modalMode === 'edit' && editingCategory ? (
        <CategoryFormModal
          title="ویرایش دسته"
          onClose={closeModal}
          onSubmit={editForm.handleSubmit(onEditSubmit)}
          formError={formError}
          isSubmitting={editForm.formState.isSubmitting || updateMutation.isPending}
        >
          <CategoryFormFields
            register={editForm.register}
            errors={editForm.formState.errors}
            setValue={editForm.setValue}
            watchIcon={editForm.watch('icon')}
          />
        </CategoryFormModal>
      ) : null}

      <ConfirmDialog
        open={Boolean(deactivatingCategory)}
        title="غیرفعال‌سازی دسته"
        message={`آیا از غیرفعال کردن «${deactivatingCategory?.name}» مطمئن هستید؟`}
        confirmLabel="غیرفعال کن"
        isLoading={deactivateMutation.isPending}
        onConfirm={() => void handleDeactivate()}
        onCancel={() => setDeactivatingCategory(null)}
      />
    </div>
  );
}

function CategoryFormModal({
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

function CategoryFormFields<TFieldValues extends FieldValues & { name: string; icon?: string }>({
  register,
  errors,
  setValue,
  watchIcon,
}: {
  register: UseFormRegister<TFieldValues>;
  errors: Record<string, { message?: string } | undefined>;
  setValue: UseFormSetValue<TFieldValues>;
  watchIcon?: string;
}) {
  return (
    <>
      <div>
        <label htmlFor="category-name" className="mb-2 block text-sm font-medium text-slate-700">
          نام دسته
        </label>
        <input
          id="category-name"
          className="field-input"
          {...register('name' as Path<TFieldValues>)}
        />
        {errors.name?.message ? (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="category-icon" className="mb-2 block text-sm font-medium text-slate-700">
          آیکون
        </label>
        <input
          id="category-icon"
          className="field-input"
          {...register('icon' as Path<TFieldValues>)}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {ICON_SUGGESTIONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() =>
                setValue(
                  'icon' as Path<TFieldValues>,
                  icon as PathValue<TFieldValues, Path<TFieldValues>>,
                )
              }
              className={[
                'rounded-lg border px-2 py-1 text-lg',
                watchIcon === icon
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 hover:bg-slate-50',
              ].join(' ')}
              aria-label={`انتخاب آیکون ${icon}`}
            >
              {icon}
            </button>
          ))}
        </div>
        {errors.icon?.message ? (
          <p className="mt-1 text-xs text-red-600">{errors.icon.message}</p>
        ) : null}
      </div>
    </>
  );
}
