import { resetPasswordSchema } from './ResetPasswordScreen';

describe('resetPasswordSchema', () => {
  it('requires the reset token, email, and matching new passwords', () => {
    expect(
      resetPasswordSchema.safeParse({
        email: 'amina@example.com',
        password: 'new-password',
        passwordConfirmation: 'new-password',
        token: 'reset-token-from-email',
      }).success,
    ).toBe(true);

    expect(
      resetPasswordSchema.safeParse({
        email: 'not-an-email',
        password: 'new-password',
        passwordConfirmation: 'different-password',
        token: '',
      }).success,
    ).toBe(false);
  });
});
