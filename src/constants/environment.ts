const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const appEnvironment = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

export const environment = {
  appEnvironment,
  apiBaseUrl: rawApiBaseUrl?.replace(/\/+$/, '') ?? '',
  isApiBaseUrlConfigured: Boolean(rawApiBaseUrl),
  isDevelopment: __DEV__,
} as const;
