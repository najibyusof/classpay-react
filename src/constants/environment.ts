const fallbackApiBaseUrl = 'https://classpay.padat.net/api/v1';
const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || fallbackApiBaseUrl;
const appEnvironment = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

export const environment = {
  appEnvironment,
  apiBaseUrl: rawApiBaseUrl.replace(/\/+$/, ''),
  isApiBaseUrlConfigured: Boolean(rawApiBaseUrl),
  isDevelopment: __DEV__,
} as const;
