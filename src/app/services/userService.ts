import { apiFetch } from './api';
import { UserDTO } from '../types';

export const userService = {
  createUser: (data: UserDTO): Promise<UserDTO> => {
    return apiFetch<UserDTO>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateUser: (id: number, data: UserDTO): Promise<UserDTO> => {
    return apiFetch<UserDTO>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
