jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { authApi } from './authApi';
import { apiClient } from './client';

const mockGet = apiClient.get as jest.Mock;
const mockPost = apiClient.post as jest.Mock;

describe('authApi', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  it('sends the documented login payload and returns its response', async () => {
    const response = {
      token: 'token-value',
      token_type: 'Bearer',
      user: {
        id: 1,
        name: 'Amina Yusuf',
        phone: '60123456789',
        email: 'amina@example.com',
        user_type: 'student',
        status: 'active',
        phone_verified_at: null,
        last_login_at: null,
      },
    };
    mockPost.mockResolvedValue({ data: response });

    await expect(
      authApi.login({
        device_name: 'ClassPay Mobile',
        password: 'not-persisted',
        phone: '60123456789',
      }),
    ).resolves.toEqual(response);

    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      device_name: 'ClassPay Mobile',
      password: 'not-persisted',
      phone: '60123456789',
    });
  });

  it('derives the registration role from the URL and does not send user_type in the body', async () => {
    const response = {
      token: 'token-value',
      token_type: 'Bearer',
      user: { id: 1, name: 'Admin User', user_type: 'admin' },
    };
    mockPost.mockResolvedValue({ data: { data: response } });

    await expect(
      authApi.register({
        device_name: 'mobile-app',
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'password123',
        password_confirmation: 'password123',
        phone: '+60123456789',
        user_type: 'admin',
      }),
    ).resolves.toEqual(response);

    expect(mockPost).toHaveBeenCalledWith('/auth/register/admin', {
      device_name: 'mobile-app',
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'password123',
      password_confirmation: 'password123',
      phone: '+60123456789',
    });
  });

  it('unwraps the standard Laravel success envelope before storing a login session', async () => {
    const response = {
      token: 'token-value',
      token_type: 'Bearer',
      user: { id: 1, name: 'Amina Yusuf' },
    };
    mockPost.mockResolvedValue({
      data: { data: response, message: 'Login successful', success: true },
    });

    await expect(
      authApi.login({
        device_name: 'ClassPay Mobile',
        password: 'not-persisted',
        phone: '60123456789',
      }),
    ).resolves.toEqual(response);
  });

  it('gets the authenticated user from the documented endpoint', async () => {
    const user = {
      id: 1,
      name: 'Amina Yusuf',
      phone: '60123456789',
      email: null,
      user_type: 'student',
      status: 'active',
      phone_verified_at: null,
      last_login_at: null,
    };
    mockGet.mockResolvedValue({ data: user });

    await expect(authApi.getCurrentUser()).resolves.toEqual(user);
    expect(mockGet).toHaveBeenCalledWith('/auth/me');
  });

  it('uses the documented password management endpoints with only password fields', async () => {
    mockPost.mockResolvedValue({ data: undefined });

    await authApi.changePassword({
      current_password: 'old-password',
      password: 'new-password',
      password_confirmation: 'new-password',
    });
    await authApi.setPassword({ password: 'new-password', password_confirmation: 'new-password' });

    expect(mockPost).toHaveBeenNthCalledWith(1, '/auth/change-password', {
      current_password: 'old-password',
      password: 'new-password',
      password_confirmation: 'new-password',
    });
    expect(mockPost).toHaveBeenNthCalledWith(2, '/auth/set-password', {
      password: 'new-password',
      password_confirmation: 'new-password',
    });
  });

  it('uses the reset-password endpoint with the email token payload', async () => {
    mockPost.mockResolvedValue({ data: undefined });

    await authApi.resetPassword({
      email: 'amina@example.com',
      password: 'new-password',
      password_confirmation: 'new-password',
      token: 'reset-token-from-email',
    });

    expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
      email: 'amina@example.com',
      password: 'new-password',
      password_confirmation: 'new-password',
      token: 'reset-token-from-email',
    });
  });

  it('refreshes a backend session and logs out without exposing tokens', async () => {
    const response = { token: 'server-token', token_type: 'Bearer', user: { id: 1 } };
    mockPost.mockResolvedValueOnce({ data: response }).mockResolvedValueOnce({ data: undefined });

    await expect(authApi.refreshToken()).resolves.toEqual(response);
    await authApi.logout();

    expect(mockPost).toHaveBeenNthCalledWith(1, '/auth/refresh-token');
    expect(mockPost).toHaveBeenNthCalledWith(2, '/auth/logout');
  });
});
