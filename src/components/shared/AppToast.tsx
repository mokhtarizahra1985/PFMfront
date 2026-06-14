interface AppToastProps {
  message: string;
  variant?: 'success' | 'error';
}

export function AppToast({ message, variant = 'success' }: AppToastProps) {
  const styles =
    variant === 'success'
      ? 'border-green-200 bg-green-50 text-green-800'
      : 'border-red-200 bg-red-50 text-red-800';

  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-3 text-sm ${styles}`}
    >
      {message}
    </div>
  );
}
