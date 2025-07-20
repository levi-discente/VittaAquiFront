export interface ProfessionalProfile {
  id: string;
  userId: string;
  userName: string;
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
  userName?: string;
  tags?: string[];
  online?: boolean;
  presencial?: boolean;
}


export interface ProfessionalListResponse {
  professionals: ProfessionalProfile[];
  total: number;
}
