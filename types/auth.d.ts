export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'professional';

  cpf: string;
  phone?: string;
  cep?: string;
  uf?: string;
  city?: string;
  address?: string;

  bio?: string;
  category?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

