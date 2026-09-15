export type UserType = string;
export type UserStatus = string;

export interface AuthenticatedUser {
  id: number | string;
  name: string;
  phone: string;
  email: string | null;
  user_type: UserType;
  status: UserStatus;
  phone_verified_at: string | null;
  last_login_at: string | null;
  requires_password_setup?: boolean;
}

export interface LoginRequest {
  phone: string;
  password: string;
  device_name: string;
}

export type RegistrationUserType = 'admin' | 'student' | 'sponsor';

export interface RegisterRequest {
  user_type: RegistrationUserType;
  name: string;
  phone: string;
  email?: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  token: string;
  token_type: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface SetPasswordRequest {
  password: string;
  password_confirmation: string;
}
