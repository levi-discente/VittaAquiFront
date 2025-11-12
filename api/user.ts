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

export const uploadProfileImage = async (imageUri: string): Promise<User> => {
  const formData = new FormData();
  
  // Extract filename from URI
  const filename = imageUri.split('/').pop() || 'profile.jpg';
  
  // Create file object for upload
  const file = {
    uri: imageUri,
    type: 'image/jpeg',
    name: filename,
  } as any;
  
  formData.append('file', file);
  
  const response = await api.post<User>('/users/me/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
