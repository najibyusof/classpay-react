import { create } from 'zustand';
import { Platform } from 'react-native';

import { authApi } from '../api/authApi';
import { registerUnauthorizedHandler } from '../services/authSessionEvents';
import { tokenStorage } from '../services/tokenStorage';
import type { AuthenticatedUser, LoginRequest, RegisterRequest } from '../types/auth';
import { toApiError } from '../types/api';

interface AuthState {
  accessToken: string | null;
  user: AuthenticatedUser | null;
  isHydrating: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
  requiresPasswordSetup: boolean;
  errorMessage: string | null;
  validationErrors: Record<string, string[]>;
  hydrate: () => Promise<void>;
  login: (payload: LoginRequest) => Promise<boolean>;
  register: (payload: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  clearError: () => void;
  setAccessToken: (accessToken: string) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  signOut: () => Promise<void>;
  completePasswordSetup: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isHydrating: true,
  isLoggingIn: false,
  isRegistering: false,
  isLoggingOut: false,
  requiresPasswordSetup: false,
  errorMessage: null,
  validationErrors: {},
  hydrate: async () => {
    if (Platform.OS === 'web') {
      set({ isHydrating: false });
      return;
    }

    const accessToken = await tokenStorage.getAccessToken();
    if (!accessToken) {
      set({ isHydrating: false });
      return;
    }

    set({ accessToken });
    try {
      const user = await authApi.getCurrentUser();
      set({ requiresPasswordSetup: user.requires_password_setup === true, user });
    } catch {
      await get().clearSession();
    } finally {
      set({ isHydrating: false });
    }
  },
  login: async (payload) => {
    set({ errorMessage: null, isLoggingIn: true, validationErrors: {} });
    try {
      const { token, user } = await authApi.login(payload);
      await tokenStorage.setAccessToken(token);
      set({
        accessToken: token,
        requiresPasswordSetup: user.requires_password_setup === true,
        user,
      });
      return true;
    } catch (error) {
      const normalizedError = toApiError(error);
      set({
        errorMessage: normalizedError.message,
        validationErrors: normalizedError.fieldErrors,
      });
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },
  register: async (payload) => {
    set({ errorMessage: null, isRegistering: true, validationErrors: {} });
    try {
      await authApi.register(payload);
      return true;
    } catch (error) {
      const normalizedError = toApiError(error);
      set({
        errorMessage: normalizedError.message,
        validationErrors: normalizedError.fieldErrors,
      });
      return false;
    } finally {
      set({ isRegistering: false });
    }
  },
  logout: async () => {
    set({ isLoggingOut: true, errorMessage: null, validationErrors: {} });
    try {
      await authApi.logout();
    } catch (error) {
      const normalizedError = toApiError(error);
      if (normalizedError.status !== 401) {
        set({ errorMessage: normalizedError.message });
      }
    } finally {
      await get().clearSession();
      set({ isLoggingOut: false });
    }
  },
  clearSession: async () => {
    await tokenStorage.clearAccessToken();
    set({ accessToken: null, requiresPasswordSetup: false, user: null });
  },
  clearError: () => set({ errorMessage: null, validationErrors: {} }),
  setAccessToken: async (accessToken) => {
    await tokenStorage.setAccessToken(accessToken);
    set({ accessToken });
  },
  refreshSession: async () => {
    try {
      const { token, user } = await authApi.refreshToken();
      await tokenStorage.setAccessToken(token);
      set({
        accessToken: token,
        requiresPasswordSetup: user.requires_password_setup === true,
        user,
      });
      return true;
    } catch {
      await get().clearSession();
      return false;
    }
  },
  completePasswordSetup: () => set({ requiresPasswordSetup: false }),
  signOut: async () => get().logout(),
}));

registerUnauthorizedHandler(() => {
  void useAuthStore.getState().clearSession();
});
