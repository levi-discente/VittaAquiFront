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

export const getProfessionalProfileById = async (
  profileId: string
): Promise<ProfessionalProfile> => {
  const response = await api.get<RawProfessional>(`/professional/profile/${profileId}`);
  const p = response.data;
  return {
    id: String(p.id),
    userId: String(p.user_id),
    userName: p.user_name,
    email: p.email,
    phone: p.phone,
    cep: p.cep,
    uf: p.uf,
    city: p.city,
    address: p.address,
    category: p.category,
    profissionalIdentification: p.profissional_identification,
    bio: p.bio,
    services: p.services ? p.services.split(',') : [],
    price: p.price,
    tags: p.tags,
    onlyOnline: p.only_online,
    onlyPresential: p.only_presential,
    rating: p.rating,
    numReviews: p.num_reviews,
  };
};

interface RawProfessional {
  id: number;
  user_id: number;
  user_name: string;
  email: string;
  phone: string;
  cep: string;
  uf: string;
  city: string;
  address: string;
  bio: string;
  category: string;
  services: string;
  profissional_identification: string;
  price: number;
  tags: string[];
  only_online: boolean;
  only_presential: boolean;
  rating: number;
  num_reviews: number;
  image_url?: string;
}

export const listProfessionals = async (
  filters: ProfessionalFilter
): Promise<ProfessionalProfile[]> => {
  const response = await api.get<RawProfessional[]>('/professional/list', { params: filters });
  return response.data.map(p => ({
    id: String(p.id),
    userId: String(p.user_id),
    userName: p.user_name,
    email: p.email,
    phone: p.phone,
    cep: p.cep,
    uf: p.uf,
    city: p.city,
    address: p.address,
    bio: p.bio,
    category: p.category,
    profissionalIdentification: p.profissional_identification,
    services: p.services ? p.services.split(',').filter(s => !!s) : [],
    price: p.price,
    tags: p.tags,
    onlyOnline: p.only_online,
    onlyPresential: p.only_presential,
    rating: p.rating,
    numReviews: p.num_reviews,
    imageUrl: (p as any).image_url,
  }));
};
