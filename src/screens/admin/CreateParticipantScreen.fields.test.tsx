import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
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

describe('CreateParticipantScreen field errors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('highlights the fields reported by the API', async () => {
    register.mockRejectedValue(
      new ApiError({
        fieldErrors: {
          email: ['The email field must be a valid email address.'],
          phone: ['The phone has already been taken.'],
        },
        kind: 'validation',
        message: 'The given data was invalid.',
      }),
    );
    const queryClient = new QueryClient();
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

    await waitFor(() => {
      expect(screen.getByText('The given data was invalid.')).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText('The phone has already been taken.')).toBeTruthy();
    });
    expect(screen.getByText('The email field must be a valid email address.')).toBeTruthy();
    expect(addClassParticipant).not.toHaveBeenCalled();
  });
});
