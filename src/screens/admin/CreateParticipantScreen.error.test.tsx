import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import { ApiError } from '../../types/api';
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

describe('CreateParticipantScreen failure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows an error message when registration fails', async () => {
    register.mockRejectedValue(
      new ApiError({ kind: 'bad_request', message: 'The phone has already been taken.' }),
    );
    const queryClient = new QueryClient();
    const alertSpy = jest.spyOn(Alert, 'alert');
    const screen = await render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <QueryClientProvider client={queryClient}>
          <CreateParticipantScreen
            classId={5}
            className="Form 5 Physics"
            onBack={jest.fn()}
            onCreated={jest.fn()}
            participantType="student"
          />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    fireEvent.changeText(screen.getByLabelText('Name *'), 'Ahmad Daniel');
    fireEvent.changeText(screen.getByLabelText('Phone Number *'), '+60123456789');
    fireEvent.press(screen.getByTestId('create-participant-submit'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    alertSpy.mock.calls[0]?.[2]?.[1]?.onPress?.();

    await waitFor(() => {
      expect(screen.getByText('The phone has already been taken.')).toBeTruthy();
    });
    expect(addClassParticipant).not.toHaveBeenCalled();
  });
});
