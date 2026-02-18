export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  userType: 'personal' | 'company';
  isEmailVerified: boolean;
  company?: string;
  organizationNumber?: string;
  vatNumber?: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'user';
  userType: 'personal' | 'company';
  company?: string;
  organizationNumber?: string;
  vatNumber?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  user: UserDTO;
  token: string;
  refreshToken: string;
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}
