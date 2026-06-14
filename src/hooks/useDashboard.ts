import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard.api';

export const DASHBOARD_QUERY_KEY = 'dashboard';

export function dashboardQueryKey(month: string) {
  return [DASHBOARD_QUERY_KEY, month] as const;
}

export function useDashboard(month: string) {
  return useQuery({
    queryKey: dashboardQueryKey(month),
    queryFn: () => dashboardApi.get(month),
  });
}
