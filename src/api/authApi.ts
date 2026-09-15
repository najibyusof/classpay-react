import { apiClient } from './client';
import { ApiError } from '../types/api';
import type {
  AuthResponse,
  AuthenticatedUser,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SetPasswordRequest,
} from '../types/auth';

export const authApi = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse | { data: AuthResponse }>(
      '/auth/login',
      payload,
    );
    return unwrapAuthResponse(data);
  },
  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const { user_type: userType, ...body } = payload;
    const { data } = await apiClient.post<AuthResponse | { data: AuthResponse }>(
      `/auth/register/${userType}`,
      body,
    );
    return unwrapAuthResponse(data);
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
  getCurrentUser: async (): Promise<AuthenticatedUser> => {
    const { data } = await apiClient.get<AuthenticatedUser | { data: AuthenticatedUser }>(
      '/auth/me',
    );
    return unwrapData(data);
  },
  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/auth/change-password', payload);
  },
  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', payload);
  },
  setPassword: async (payload: SetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/set-password', payload);
  },
  refreshToken: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse | { data: AuthResponse }>(
      '/auth/refresh-token',
    );
    return unwrapAuthResponse(data);
  },
};

function unwrapAuthResponse(data: AuthResponse | { data: AuthResponse }): AuthResponse {
  const response = unwrapData(data);
  if (!response.token || !response.user || typeof response.token !== 'string') {
    throw new ApiError({
      kind: 'unknown',
      message: 'The authentication response was incomplete. Please try again.',
    });
  }
  return response;
}

function unwrapData<Value>(data: Value | { data: Value }): Value {
  return typeof data === 'object' && data !== null && 'data' in data ? (data.data as Value) : data;
}
