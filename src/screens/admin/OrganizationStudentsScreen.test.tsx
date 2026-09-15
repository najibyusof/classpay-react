import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { adminApi } from '../../api/adminApi';
import { OrganizationStudentsScreen } from './OrganizationStudentsScreen';

jest.mock('../../api/adminApi', () => ({
  adminApi: { getAdminStudents: jest.fn() },
}));

const getAdminStudents = adminApi.getAdminStudents as jest.Mock;

const initialMetrics = {
  frame: { height: 0, width: 0, x: 0, y: 0 },
  insets: { bottom: 0, left: 0, right: 0, top: 0 },
};

describe('OrganizationStudentsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
  });

  it('lists student names and phone numbers', async () => {
    getAdminStudents.mockResolvedValue({
      data: [
        { id: 1, name: 'Ahmad Daniel', phone: '+60123456789' },
        { id: 2, name: 'Maya Ali', phone: '+60198765432' },
      ],
      meta: { current_page: 1, last_page: 1 },
    });
    const queryClient = new QueryClient();
    const screen = await render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <QueryClientProvider client={queryClient}>
          <OrganizationStudentsScreen
            onBack={jest.fn()}
            organizationId={1}
            organizationName="Padat Inc"
          />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Ahmad Daniel')).toBeTruthy();
    });
    expect(screen.getByText('+60123456789')).toBeTruthy();
    expect(screen.getByText('Maya Ali')).toBeTruthy();
    expect(screen.getByText('+60198765432')).toBeTruthy();
  });

  it('shows an empty state when there are no students', async () => {
    getAdminStudents.mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1 },
    });
    const queryClient = new QueryClient();
    const screen = await render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <QueryClientProvider client={queryClient}>
          <OrganizationStudentsScreen
            onBack={jest.fn()}
            organizationId={1}
            organizationName="Padat Inc"
          />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('No students found')).toBeTruthy();
    });
  });
});
