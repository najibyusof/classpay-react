import type { AuthenticatedUser } from '../types/auth';
import { isSupportedUserType } from './roleNavigation';

export type AuthenticationRoute =
  'Splash' | 'Login' | 'InitialPassword' | 'StudentApp' | 'SponsorApp' | 'AdminApp';

export function getAuthenticationRoute({
  isHydrating,
  user,
  requiresPasswordSetup,
}: {
  isHydrating: boolean;
  user: AuthenticatedUser | null;
  requiresPasswordSetup: boolean;
}): AuthenticationRoute {
  if (isHydrating) {
    return 'Splash';
  }

  if (!user) {
    return 'Login';
  }

  if (requiresPasswordSetup) {
    return 'InitialPassword';
  }

  if (!isSupportedUserType(user.user_type)) {
    return 'Login';
  }

  return user.user_type === 'student'
    ? 'StudentApp'
    : user.user_type === 'sponsor'
      ? 'SponsorApp'
      : 'AdminApp';
}
