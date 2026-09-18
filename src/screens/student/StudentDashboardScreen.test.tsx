import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { studentApi } from '../../api/studentApi';
import { useAuthStore } from '../../store/authStore';
import { StudentDashboardScreen } from './StudentDashboardScreen';

jest.mock('../../api/studentApi', () => ({
  studentApi: {
    getCurrentPaymentSchedule: jest.fn(),
    getMyClasses: jest.fn(),
    getMyOrganizations: jest.fn(),
    getPaymentSchedules: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: jest.fn() }) };
});

const getCurrentPaymentSchedule = studentApi.getCurrentPaymentSchedule as jest.Mock;
const getMyClasses = studentApi.getMyClasses as jest.Mock;
const getMyOrganizations = studentApi.getMyOrganizations as jest.Mock;
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
    getMyOrganizations.mockResolvedValue({
      data: [{ id: 1, name: 'Al-Huda Education' }],
      meta: { current_page: 1, last_page: 1 },
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
    getMyClasses.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Quran Class',
          teacher_name: 'Cikgu Ahmad',
          day_of_week: 1,
          start_time: '10:00:00',
        },
        {
          id: 2,
          name: 'Fardhu Ain',
          teacher_name: 'Cikgu Aisyah',
          day_of_week: 3,
          start_time: '14:00:00',
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
    expect(screen.getByText('Cikgu Ahmad')).toBeTruthy();
    expect(screen.getByText('Isnin, 10:00 AM')).toBeTruthy();
    expect(screen.getByText('Fardhu Ain')).toBeTruthy();
    expect(screen.getByText('Rabu, 2:00 PM')).toBeTruthy();
    expect(screen.getByText('Tertunggak')).toBeTruthy();
    expect(screen.getByText('Telah Dibayar')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('Al-Huda Education')).toBeTruthy();
    });
  });

  it('prompts to view organizations when the student belongs to more than one', async () => {
    getCurrentPaymentSchedule.mockResolvedValue(null);
    getMyClasses.mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1 } });
    getPaymentSchedules.mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1 },
    });
    getMyOrganizations.mockResolvedValue({
      data: [
        { id: 1, name: 'Al-Huda Education' },
        { id: 2, name: 'Padat Inc' },
      ],
      meta: { current_page: 1, last_page: 1 },
    });
    const screen = await renderScreen();

    await waitFor(() => {
      expect(
        screen.getByText('Klik disini untuk melihat senarai organisasi'),
      ).toBeTruthy();
    });
  });

  it('shows no pending payment message when there is no current schedule', async () => {
    getCurrentPaymentSchedule.mockResolvedValue(null);
    getMyClasses.mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1 } });
    getPaymentSchedules.mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1 },
    });
    getMyOrganizations.mockResolvedValue({
      data: [{ id: 1, name: 'Al-Huda Education' }],
      meta: { current_page: 1, last_page: 1 },
    });
    const screen = await renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Tiada Tunggakan Bayaran')).toBeTruthy();
    });
  });
});
