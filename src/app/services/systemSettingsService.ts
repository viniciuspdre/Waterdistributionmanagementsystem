import { apiFetch } from './api';
import { SystemSettingsDTO } from '../types';

export const systemSettingsService = {
  findSystemSettings: (): Promise<SystemSettingsDTO> => {
    return apiFetch<SystemSettingsDTO>('/system-settings', {
      method: 'GET',
    });
  },

  updateSystemSettings: (data: SystemSettingsDTO): Promise<SystemSettingsDTO> => {
    return apiFetch<SystemSettingsDTO>('/system-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
