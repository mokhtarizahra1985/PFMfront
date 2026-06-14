import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/api/settings.api';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrencyDisplay() {
  const { data } = useSettings();
  return data?.currencyDisplay ?? 'TOMAN';
}
