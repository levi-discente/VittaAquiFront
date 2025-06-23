import api from './api';
import { ProfessionalProfile, ProfessionalFilter } from '../types/professional';

export const createProfessionalProfile = async (
  data: Partial<ProfessionalProfile>
): Promise<ProfessionalProfile> => {
  const response = await api.post<ProfessionalProfile>('/professional/profile', data);
  return response.data;
};

export const getProfessionalProfileByUser = async (userId: string): Promise<ProfessionalProfile> => {
  const response = await api.get<ProfessionalProfile>(`/professional/profile/user/${userId}`);
  return response.data;
};

export const listProfessionals = async (filters: ProfessionalFilter): Promise<ProfessionalProfile[]> => {
  const response = await api.get<ProfessionalProfile[]>('/professional/list', { params: filters });
  return response.data;
};
