interface LoadingSkeletonProps {
  variant?: 'page' | 'card' | 'table';
}

export function LoadingSkeleton({ variant = 'card' }: LoadingSkeletonProps) {
  if (variant === 'page') {
    return (
      <div className="w-full max-w-4xl animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-slate-200/70" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-slate-200/70" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-14 rounded-xl bg-slate-200/70" />
        ))}
      </div>
    );
  }

  return <div className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />;
}
