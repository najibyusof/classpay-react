import { getAuthenticationRoute } from './authNavigation';
import type { AuthenticatedUser } from '../types/auth';

const user: AuthenticatedUser = {
  email: 'amina@example.com',
  id: 1,
  last_login_at: null,
  name: 'Amina Yusuf',
  phone: '+60123456789',
  phone_verified_at: null,
  status: 'active',
  user_type: 'student',
};

describe('getAuthenticationRoute', () => {
  it('keeps the splash screen visible during session restoration', () => {
    expect(
      getAuthenticationRoute({ isHydrating: true, requiresPasswordSetup: false, user: null }),
    ).toBe('Splash');
  });

  it('routes an unauthenticated session to login', () => {
    expect(
      getAuthenticationRoute({ isHydrating: false, requiresPasswordSetup: false, user: null }),
    ).toBe('Login');
  });

  it('routes a server-marked password setup account to the initial password screen', () => {
    expect(getAuthenticationRoute({ isHydrating: false, requiresPasswordSetup: true, user })).toBe(
      'InitialPassword',
    );
  });

  it.each([
    ['student', 'StudentApp'],
    ['sponsor', 'SponsorApp'],
    ['admin', 'AdminApp'],
  ] as const)(
    'routes the %s user type from the authenticated response to %s',
    (userType, route) => {
      expect(
        getAuthenticationRoute({
          isHydrating: false,
          requiresPasswordSetup: false,
          user: { ...user, user_type: userType },
        }),
      ).toBe(route);
    },
  );

  it('rejects unsupported server user types to the login route', () => {
    expect(
      getAuthenticationRoute({
        isHydrating: false,
        requiresPasswordSetup: false,
        user: { ...user, user_type: 'unknown' },
      }),
    ).toBe('Login');
  });

  it('routes a logged-out session to login', () => {
    expect(
      getAuthenticationRoute({ isHydrating: false, requiresPasswordSetup: false, user: null }),
    ).toBe('Login');
  });
});
