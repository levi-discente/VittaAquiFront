export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'professional';

  cpf: string;
  phone?: string;
  cep?: string;
  uf?: string;
  city?: string;
  address?: string;

  professional_profile?: ProfessionalProfile;
}

export interface UpdateUserData {
  name?: string;
  email?: string;

  cpf?: string;
  phone?: string;
  cep?: string;
  uf?: string;
  city?: string;
  address?: string;
}

