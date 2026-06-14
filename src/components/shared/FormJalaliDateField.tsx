import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { JalaliDateInput } from '@/components/shared/JalaliDateInput';

interface FormJalaliDateFieldProps<TFieldValues extends FieldValues> {
  label: string;
  id: string;
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  error?: string;
}

export function FormJalaliDateField<TFieldValues extends FieldValues>({
  label,
  id,
  name,
  control,
  error,
}: FormJalaliDateFieldProps<TFieldValues>) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <JalaliDateInput
            id={id}
            value={field.value ?? ''}
            onChange={field.onChange}
          />
        )}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
