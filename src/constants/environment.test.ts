import { environment } from './environment';

describe('environment', () => {
  it('requires an explicit API base URL configuration', () => {
    expect(environment.isApiBaseUrlConfigured).toBe(Boolean(process.env.EXPO_PUBLIC_API_BASE_URL));
  });
});
