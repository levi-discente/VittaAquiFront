import api from './api';
import { LoginData, RegisterData, AuthResponse } from '../types/auth';

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  console.log(response.data);
  return response.data;
};
