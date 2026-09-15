import axios from 'axios';

import { environment } from '../constants/environment';
import { notifyUnauthorized } from '../services/authSessionEvents';
import { tokenStorage } from '../services/tokenStorage';
import { normalizeApiError } from '../types/api';
import { ApiError } from '../types/api';

export const apiClient = axios.create({
  baseURL: environment.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (!environment.isApiBaseUrlConfigured) {
    return Promise.reject(
      new ApiError({
        kind: 'configuration',
        message:
          'The application API is not configured. Set the development API URL and restart the app.',
      }),
    );
  }

  const accessToken = await tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.url !== '/auth/login'
    ) {
      notifyUnauthorized();
    }

    return Promise.reject(normalizeApiError(error));
  },
);
