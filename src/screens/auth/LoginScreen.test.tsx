import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { LoginScreen, loginSchema } from './LoginScreen';

describe('LoginScreen', () => {
  it('shows a validation error for an invalid Malaysian phone number', async () => {
    const screen = await render(<LoginScreen />);

    fireEvent.changeText(screen.getByLabelText('Phone number'), '12345');
    fireEvent.changeText(screen.getByLabelText('Password'), 'password');
    fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByText('Enter a valid Malaysian phone number')).toBeTruthy();
    });
  });

  it('rejects a missing password before login is submitted', () => {
    expect(
      loginSchema.safeParse({
        password: '',
        phone: '0123456789',
      }).success,
    ).toBe(false);
  });
});
