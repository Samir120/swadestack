export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  userType: 'personal' | 'company';
  isEmailVerified?: boolean;
  company?: string;
  organizationNumber?: string;
  vatNumber?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'personal' | 'company';
  company?: string;
  organizationNumber?: string;
  vatNumber?: string;
}
