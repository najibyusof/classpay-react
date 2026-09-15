import { changePasswordSchema } from './ChangePasswordScreen';

describe('changePasswordSchema', () => {
  it('requires the current password and matching new passwords', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'current-password',
        password: 'new-password',
        passwordConfirmation: 'new-password',
      }).success,
    ).toBe(true);

    expect(
      changePasswordSchema.safeParse({
        currentPassword: '',
        password: 'new-password',
        passwordConfirmation: 'different-password',
      }).success,
    ).toBe(false);
  });
});
