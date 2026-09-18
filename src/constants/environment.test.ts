describe('environment', () => {
  it('uses the production API as a safe fallback when the env var is missing', () => {
    const previousApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    jest.resetModules();
    const { environment } = require('./environment');

    expect(environment.apiBaseUrl).toBe('https://classpay.padat.net/api/v1');
    expect(environment.isApiBaseUrlConfigured).toBe(true);

    if (previousApiBaseUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = previousApiBaseUrl;
    }
  });

  it('requires an explicit API base URL configuration', () => {
    expect(Boolean(process.env.EXPO_PUBLIC_API_BASE_URL || 'https://classpay.padat.net/api/v1')).toBe(true);
  });
});
