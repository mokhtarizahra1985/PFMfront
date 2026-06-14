import { ApiClientError } from '@/api/client';

export function getFieldError(
  fields: Record<string, string> | undefined,
  field: string,
): string | undefined {
  return fields?.[field];
}

export function getFormErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  return 'خطای ناشناخته رخ داد.';
}

export function applyApiFieldErrors<T extends Record<string, unknown>>(
  error: unknown,
  setError: (name: keyof T & string, error: { message: string }) => void,
): boolean {
  if (!(error instanceof ApiClientError) || !error.fields) {
    return false;
  }

  Object.entries(error.fields).forEach(([field, message]) => {
    setError(field as keyof T & string, { message: String(message) });
  });

  return true;
}
