import type { Category } from '@/types/api.types';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDeactivate: (category: Category) => void;
}

export function CategoryCard({
  category,
  onEdit,
  onDeactivate,
}: CategoryCardProps) {
  return (
    <article
      className={[
        'surface-card flex items-center justify-between gap-3 p-4',
        category.isActive ? 'border-slate-200' : 'border-slate-200 opacity-75',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">
          {category.icon || '📦'}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{category.name}</h3>
            {category.isDefault ? (
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                پیش‌فرض
              </span>
            ) : null}
            {!category.isActive ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                غیرفعال
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {category.isActive ? (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            ویرایش
          </button>
          {!category.isDefault ? (
            <button
              type="button"
              onClick={() => onDeactivate(category)}
              className="rounded-xl border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
            >
              غیرفعال
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
