import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import { CreateParticipantScreen } from './CreateParticipantScreen';

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

describe('CreateParticipantScreen sponsor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
  });

  it('registers the sponsor, assigns them to the class, and refreshes the list', async () => {
    register.mockResolvedValue({
      token: 'token',
      token_type: 'Bearer',
      user: { id: 43, name: 'Maya Ali' },
    });
    addClassParticipant.mockResolvedValue({ id: 8 });
    const alertSpy = jest.spyOn(Alert, 'alert');
    const queryClient = new QueryClient();
    const onCreated = jest.fn();
    const screen = await render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <QueryClientProvider client={queryClient}>
          <CreateParticipantScreen
            classId={5}
            className="Form 5 Physics"
            onBack={jest.fn()}
            onCreated={onCreated}
            participantType="sponsor"
          />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    fireEvent.changeText(screen.getByLabelText('Name *'), 'Maya Ali');
    fireEvent.changeText(screen.getByLabelText('Phone Number *'), '+60198765432');
    fireEvent.press(screen.getByTestId('create-participant-submit'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    alertSpy.mock.calls[0]?.[2]?.[1]?.onPress?.();

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        device_name: '-',
        email: undefined,
        name: 'Maya Ali',
        password: 'password',
        password_confirmation: 'password',
        phone: '+60198765432',
        user_type: 'sponsor',
      });
    });
    await waitFor(() => {
      expect(addClassParticipant).toHaveBeenCalledWith(5, {
        participant_type: 'sponsor',
        user_id: 43,
      });
    });
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['admin', 'classes', 5, 'participants'],
      });
    });

    const [title, message, buttons] = alertSpy.mock.calls[1] ?? [];
    expect(title).toBe('Sponsor created');
    expect(message).toBe('Maya Ali was added to Form 5 Physics.');
    buttons?.[0]?.onPress?.();
    expect(onCreated).toHaveBeenCalled();
  });
});
