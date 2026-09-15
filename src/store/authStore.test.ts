jest.mock('../api/authApi', () => ({
  authApi: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  },
}));
jest.mock('../services/tokenStorage', () => ({
  tokenStorage: {
    clearAccessToken: jest.fn(),
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
  },
}));
jest.mock('../services/authSessionEvents', () => ({
  registerUnauthorizedHandler: jest.fn((handler) => {
    mockUnauthorizedHandler = handler;
  }),
}));

import { authApi } from '../api/authApi';
import { tokenStorage } from '../services/tokenStorage';
import { normalizeApiError } from '../types/api';
import { useAuthStore } from './authStore';

const refreshToken = authApi.refreshToken as jest.Mock;
const getCurrentUser = authApi.getCurrentUser as jest.Mock;
const login = authApi.login as jest.Mock;
const register = authApi.register as jest.Mock;
const logout = authApi.logout as jest.Mock;
const clearAccessToken = tokenStorage.clearAccessToken as jest.Mock;
const getAccessToken = tokenStorage.getAccessToken as jest.Mock;
const setAccessToken = tokenStorage.setAccessToken as jest.Mock;
let mockUnauthorizedHandler: (() => void) | undefined;

const refreshedUser = {
  email: 'amina@example.com',
  id: 1,
  last_login_at: null,
  name: 'Amina Yusuf',
  phone: '+60123456789',
  phone_verified_at: null,
  status: 'active',
  user_type: 'student',
};

describe('authStore refreshSession', () => {
  beforeEach(() => {
    clearAccessToken.mockReset();
    getAccessToken.mockReset();
    getCurrentUser.mockReset();
    login.mockReset();
    register.mockReset();
    logout.mockReset();
    refreshToken.mockReset();
    setAccessToken.mockReset();
    useAuthStore.setState({ accessToken: 'old-token', user: refreshedUser });
  });

  it('replaces the secure session with the backend-refreshed token and user', async () => {
    refreshToken.mockResolvedValue({
      token: 'new-token',
      token_type: 'Bearer',
      user: refreshedUser,
    });

    await expect(useAuthStore.getState().refreshSession()).resolves.toBe(true);

    expect(setAccessToken).toHaveBeenCalledWith('new-token');
    expect(useAuthStore.getState().accessToken).toBe('new-token');
    expect(useAuthStore.getState().user).toEqual(refreshedUser);
  });

  it('clears the secure session when token refresh is revoked or fails', async () => {
    refreshToken.mockRejectedValue(new Error('revoked'));

    await expect(useAuthStore.getState().refreshSession()).resolves.toBe(false);

    expect(clearAccessToken).toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('stores only the returned token and user after a successful login', async () => {
    login.mockResolvedValue({ token: 'new-token', token_type: 'Bearer', user: refreshedUser });

    await expect(
      useAuthStore.getState().login({
        device_name: 'ClassPay test device',
        password: 'not-persisted',
        phone: '+60123456789',
      }),
    ).resolves.toBe(true);

    expect(setAccessToken).toHaveBeenCalledWith('new-token');
    expect(useAuthStore.getState().user).toEqual(refreshedUser);
  });

  it('keeps the session clear when login fails', async () => {
    login.mockRejectedValue(new Error('Network Error'));

    await expect(
      useAuthStore.getState().login({
        device_name: 'ClassPay test device',
        password: 'not-persisted',
        phone: '+60123456789',
      }),
    ).resolves.toBe(false);

    expect(useAuthStore.getState().accessToken).toBe('old-token');
    expect(useAuthStore.getState().errorMessage).toBe(
      normalizeApiError(new Error('Network Error')).message,
    );
  });

  it('does not create a local session after successful registration', async () => {
    register.mockResolvedValue({
      token: 'registration-token',
      token_type: 'Bearer',
      user: refreshedUser,
    });
    useAuthStore.setState({ accessToken: null, user: null });

    await expect(
      useAuthStore.getState().register({
        device_name: 'mobile-app',
        name: 'Amina Yusuf',
        password: 'password123',
        password_confirmation: 'password123',
        phone: '+60123456789',
        user_type: 'student',
      }),
    ).resolves.toBe(true);

    expect(setAccessToken).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('restores and validates a stored session with the authenticated user endpoint', async () => {
    getAccessToken.mockResolvedValue('stored-token');
    getCurrentUser.mockResolvedValue(refreshedUser);
    useAuthStore.setState({ accessToken: null, isHydrating: true, user: null });

    await useAuthStore.getState().hydrate();

    expect(getCurrentUser).toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBe('stored-token');
    expect(useAuthStore.getState().user).toEqual(refreshedUser);
  });

  it('clears the local session on logout and unauthorized handling', async () => {
    logout.mockResolvedValue(undefined);
    await useAuthStore.getState().logout();
    expect(clearAccessToken).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();

    useAuthStore.setState({ accessToken: 'stored-token', user: refreshedUser });
    await mockUnauthorizedHandler?.();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
