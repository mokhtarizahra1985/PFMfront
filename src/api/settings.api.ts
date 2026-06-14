import { apiClient } from './client';
import type { ApiResponse, Settings, CurrencyDisplay } from '@/types/api.types';

export interface UpdateSettingsInput {
  currencyDisplay?: CurrencyDisplay;
  timezone?: string;
}

export const settingsApi = {
  get: async (): Promise<Settings> => {
    const { data } = await apiClient.get<ApiResponse<Settings>>('/settings');
    return data.data;
  },

  update: async (input: UpdateSettingsInput): Promise<Settings> => {
    const { data } = await apiClient.patch<ApiResponse<Settings>>(
      '/settings',
      input,
    );
    return data.data;
  },
};
