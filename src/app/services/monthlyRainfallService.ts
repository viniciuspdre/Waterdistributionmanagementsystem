import { apiFetch } from './api';
import { MonthlyRainfallDTO } from '../types';

export const monthlyRainfallService = {
  save: (data: MonthlyRainfallDTO): Promise<MonthlyRainfallDTO> => {
    return apiFetch<MonthlyRainfallDTO>('/monthly-rainfall', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: (id: number): Promise<void> => {
    return apiFetch<void>(`/monthly-rainfall/${id}`, {
      method: 'DELETE',
    });
  },

  findByYear: (year: number): Promise<MonthlyRainfallDTO[]> => {
    return apiFetch<MonthlyRainfallDTO[]>(`/monthly-rainfall/year/${year}`, {
      method: 'GET',
    });
  },
};
