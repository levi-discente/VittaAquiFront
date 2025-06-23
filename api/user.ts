import api from './api';
import { User } from '../types/user';

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/user/me');
  return response.data;
};

export const updateMe = async (data: Partial<User>): Promise<User> => {
  const response = await api.put<User>('/user/me', data);
  return response.data;
};

export const deleteMe = async (): Promise<{ message: string }> => {
  const response = await api.delete('/user/me');
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/user/${id}`);
  return response.data;
};
