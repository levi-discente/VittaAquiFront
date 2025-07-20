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

interface RawProfessional {
  id: number;
  user_id: number;
  user_name: string;
  bio: string;
  category: string;
  services: string;        // string vazia ou "a,b,c"
  price: number;
  tags: string[];          // já vem array
  only_online: boolean;
  only_presential: boolean;
  rating: number;
  num_reviews: number;
}

export const listProfessionals = async (
  filters: ProfessionalFilter
): Promise<ProfessionalProfile[]> => {
  const response = await api.get<RawProfessional[]>('/professional/list', { params: filters });
  return response.data.map(p => ({
    id: String(p.id),
    userId: String(p.user_id),
    userName: p.user_name,
    category: p.category,
    bio: p.bio,
    services: p.services ? p.services.split(',') : [],
    price: p.price,
    tags: p.tags,
    online: p.only_online,
    presencial: p.only_presential,
    rating: p.rating,
    numReviews: p.num_reviews,
  }));
};
