import { httpPostFetch } from './httpPostFetch';
import { LoginRequest, LoginResponse } from '../models/authModel';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return httpPostFetch('/auth/login', credentials);
  },
  logout: async (): Promise<void> => {
    return httpPostFetch('/auth/logout', {});
  },
};
