import { isSupportedUserType } from './roleNavigation';

describe('isSupportedUserType', () => {
  it.each(['student', 'sponsor', 'admin'])(
    'allows the %s role from the authenticated API user',
    (userType) => {
      expect(isSupportedUserType(userType)).toBe(true);
    },
  );

  it('rejects an unsupported role', () => {
    expect(isSupportedUserType('superadmin')).toBe(false);
  });
});
