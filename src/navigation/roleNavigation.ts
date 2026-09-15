import type { UserType } from '../types/auth';

export type SupportedUserType = 'student' | 'sponsor' | 'admin';

export function isSupportedUserType(userType: UserType): userType is SupportedUserType {
  return userType === 'student' || userType === 'sponsor' || userType === 'admin';
}
