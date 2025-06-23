export interface ProfessionalProfile {
  id: string;
  userId: string;
  name: string;
  category: string;
  bio: string;
  services?: string[];
  price?: number;
  tags?: string[];
  online?: boolean;
  presencial?: boolean;
}

export interface ProfessionalFilter {
  category?: string;
  name?: string;
  tags?: string[];
  online?: boolean;
  presencial?: boolean;
}


export interface ProfessionalListResponse {
  professionals: ProfessionalProfile[];
  total: number;
}
