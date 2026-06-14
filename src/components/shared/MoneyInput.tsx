import { forwardRef, type InputHTMLAttributes } from 'react';
import { useMoney } from '@/hooks/useMoney';

interface MoneyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  function MoneyInput({ label, error, id, ...props }, ref) {
    const { unitLabel } = useMoney();
    const inputId = id ?? 'money-input';

    return (
      <div>
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-slate-700">
          {label} ({unitLabel})
        </label>
        <input
          {...props}
          ref={ref}
          id={inputId}
          type="text"
          inputMode="numeric"
          className="field-input"
        />
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  },
);
