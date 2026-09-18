import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import {
  CreateParticipantScreen,
  createParticipantSchema,
} from './CreateParticipantScreen';

jest.mock('../../api/adminApi', () => ({
  adminApi: { addClassParticipant: jest.fn() },
}));

jest.mock('../../api/authApi', () => ({
  authApi: { register: jest.fn() },
}));

const register = authApi.register as jest.Mock;
const addClassParticipant = adminApi.addClassParticipant as jest.Mock;

const initialMetrics = {
  frame: { height: 0, width: 0, x: 0, y: 0 },
  insets: { bottom: 0, left: 0, right: 0, top: 0 },
};

function renderScreen(onCreated = jest.fn(), onBack = jest.fn()) {
  const queryClient = new QueryClient();
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <QueryClientProvider client={queryClient}>
        <CreateParticipantScreen
          classId={5}
          className="Form 5 Physics"
          onBack={onBack}
          onCreated={onCreated}
          participantType="student"
        />
      </QueryClientProvider>
    </SafeAreaProvider>,
  ).then((screen) => ({ onBack, onCreated, queryClient, screen }));
}

describe('CreateParticipantScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
  });

  it('registers the student, assigns them to the class, and refreshes the list', async () => {
    register.mockResolvedValue({
      token: 'token',
      token_type: 'Bearer',
      user: { id: 42, name: 'Ahmad Daniel' },
    });
    addClassParticipant.mockResolvedValue({ id: 7 });
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { onCreated, queryClient, screen } = await renderScreen();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    fireEvent.changeText(screen.getByLabelText('Name *'), 'Ahmad Daniel');
    fireEvent.changeText(screen.getByLabelText('Phone Number *'), '+60123456789');
    fireEvent.changeText(screen.getByLabelText('Email'), 'student@example.com');
    fireEvent.press(screen.getByTestId('create-participant-submit'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    alertSpy.mock.calls[0]?.[2]?.[1]?.onPress?.();

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        device_name: '-',
        email: 'student@example.com',
        name: 'Ahmad Daniel',
        password: 'password',
        password_confirmation: 'password',
        phone: '+60123456789',
        user_type: 'student',
      });
    });
    await waitFor(() => {
      expect(addClassParticipant).toHaveBeenCalledWith(5, {
        participant_type: 'student',
        user_id: 42,
      });
    });
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['admin', 'classes', 5, 'participants'],
      });
    });

    const [title, message, buttons] = alertSpy.mock.calls[1] ?? [];
    expect(title).toBe('Student created');
    expect(message).toBe('Ahmad Daniel was added to Form 5 Physics.');
    buttons?.[0]?.onPress?.();
    expect(onCreated).toHaveBeenCalled();
  });

  it('requires name and phone and validates email format', () => {
    expect(createParticipantSchema.safeParse({ email: '', name: '', phone: '' }).success).toBe(
      false,
    );
    expect(
      createParticipantSchema.safeParse({
        email: 'not-an-email',
        name: 'Ahmad Daniel',
        phone: '+60123456789',
      }).success,
    ).toBe(false);
    expect(
      createParticipantSchema.safeParse({
        email: '',
        name: 'Ahmad Daniel',
        phone: '+60123456789',
      }).success,
    ).toBe(true);
  });
});
