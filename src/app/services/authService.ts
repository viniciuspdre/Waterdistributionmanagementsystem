import { apiFetch } from './api';
import { LoginDTO, TokenDTO } from '../types';

export const authService = {
  login: (data: LoginDTO): Promise<TokenDTO> => {
    return apiFetch<TokenDTO>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
