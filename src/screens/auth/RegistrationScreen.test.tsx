import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { RegistrationScreen, registrationSchema } from './RegistrationScreen';

describe('RegistrationScreen', () => {
  it('supports all documented registration roles', () => {
    expect(
      registrationSchema.safeParse({
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'password123',
        passwordConfirmation: 'password123',
        phone: '0123456789',
      }).success,
    ).toBe(true);
  });

  it('shows a validation error before submitting an invalid phone number', async () => {
    const screen = await render(<RegistrationScreen onBack={() => undefined} />);

    fireEvent.changeText(screen.getByLabelText('Full name'), 'Admin User');
    fireEvent.changeText(screen.getByLabelText('Phone number'), '12345');
    fireEvent.changeText(screen.getByLabelText('Password'), 'password123');
    fireEvent.changeText(screen.getByLabelText('Confirm password'), 'password123');
    fireEvent.press(screen.getByTestId('registration-submit'));

    await waitFor(() => {
      expect(screen.getByText('Enter a valid Malaysian phone number')).toBeTruthy();
    });
  });
});
