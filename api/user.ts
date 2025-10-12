import api from './api';
import { User } from '../types/user';

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

export const updateMe = async (data: Partial<User>): Promise<User> => {
  const response = await api.put<User>('/users/me', data);
  return response.data;
};

export const deleteMe = async (): Promise<void> => {
  await api.delete('/users/me');
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};

export const listUsers = async (skip: number = 0, limit: number = 100): Promise<User[]> => {
  const response = await api.get<User[]>('/users/', { params: { skip, limit } });
  return response.data;
};
