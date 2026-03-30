import { apiFetch } from './api';
import { WaterDeliveryDTO } from '../types';

export const waterDeliveryService = {
  save: (data: WaterDeliveryDTO): Promise<WaterDeliveryDTO> => {
    return apiFetch<WaterDeliveryDTO>('/water-deliveries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  findByYearAndFamilyId: (year: number, familyId: number): Promise<WaterDeliveryDTO[]> => {
    return apiFetch<WaterDeliveryDTO[]>(`/water-deliveries/year/${year}/family/${familyId}`, {
      method: 'GET',
    });
  },
};
