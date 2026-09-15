import { getRegistrationCapability, isPublicRegistrationAvailable } from './capabilities';

describe('registration capabilities', () => {
  it.each(['admin', 'student', 'sponsor'] as const)('allows public %s registration', (role) => {
    expect(isPublicRegistrationAvailable(role)).toBe(true);
    expect(getRegistrationCapability(role).unavailableMessage).toBe('');
  });
});
