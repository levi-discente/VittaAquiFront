export interface ProfessionalProfile {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  cep: string;
  uf: string;
  city: string;
  address: string;
  bio: string;
  category: string;
  profissionalIdentification: string;
  services: string[];
  price: number;
  tags: string[];
  onlyOnline: boolean;
  onlyPresential: boolean;
  rating: number;
  numReviews: number;
  imageUrl?: string;
}


export interface ProfessionalFilter {
  category?: string;
  name?: string;
  tags?: string;
  only_online?: boolean;
  only_presential?: boolean;
}


export interface ProfessionalListResponse {
  professionals: ProfessionalProfile[];
  total: number;
}
