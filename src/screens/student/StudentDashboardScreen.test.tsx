import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { studentApi } from '../../api/studentApi';
import { useAuthStore } from '../../store/authStore';
import { StudentDashboardScreen } from './StudentDashboardScreen';

jest.mock('../../api/studentApi', () => ({
  studentApi: {
    getCurrentPaymentSchedule: jest.fn(),
    getPaymentSchedules: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: jest.fn() }) };
});

const getCurrentPaymentSchedule = studentApi.getCurrentPaymentSchedule as jest.Mock;
const getPaymentSchedules = studentApi.getPaymentSchedules as jest.Mock;

const initialMetrics = {
  frame: { height: 0, width: 0, x: 0, y: 0 },
  insets: { bottom: 0, left: 0, right: 0, top: 0 },
};

function renderScreen() {
  const queryClient = new QueryClient();
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <QueryClientProvider client={queryClient}>
        <StudentDashboardScreen />
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
}

describe('StudentDashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: { id: 1, name: 'Ahmad', phone: '+60123456789' } as never,
    });
  });

  afterEach(async () => {
    await cleanup();
  });

  it('greets the student and shows the payment summary and classes', async () => {
    getCurrentPaymentSchedule.mockResolvedValue({
      id: 1,
      due_date: '2026-10-01',
      required_amount: 100,
      payment_status: 'due',
      class: { id: 1, name: 'Quran Class' },
    });
    getPaymentSchedules.mockResolvedValue({
      data: [
        {
          id: 1,
          due_date: '2026-10-01',
          required_amount: 100,
          payment_status: 'due',
          class: { id: 1, name: 'Quran Class' },
        },
        {
          id: 2,
          due_date: '2026-09-01',
          required_amount: 50,
          payment_status: 'paid',
          class: { id: 2, name: 'Fardhu Ain' },
        },
      ],
      meta: { current_page: 1, last_page: 1 },
    });
    const screen = await renderScreen();

    await waitFor(() => {
      expect(screen.getByText(/Hai, Ahmad!/)).toBeTruthy();
    });
    expect(screen.getByText('Ringkasan Pembayaran')).toBeTruthy();
    expect(screen.getByText('Bayar Sekarang')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('Kelas Saya')).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText('Quran Class')).toBeTruthy();
    });
    expect(screen.getByText('Fardhu Ain')).toBeTruthy();
    expect(screen.getByText('Tertunggak')).toBeTruthy();
    expect(screen.getByText('Telah Dibayar')).toBeTruthy();
  });
});
