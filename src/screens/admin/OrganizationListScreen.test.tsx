jest.mock('../../hooks/useAdminDashboard', () => ({
  adminQueryKeys: {
    organizationDashboard: jest.fn(),
  },
  useAdminDashboard: jest.fn(() => ({
    error: new Error('request failed'),
    isError: true,
    isLoading: false,
    refetch: jest.fn(),
  })),
  useAdminOrganizations: jest.fn(() => ({
    data: undefined,
    error: new Error('Network Error'),
    isError: true,
    isLoading: false,
    refetch: jest.fn(),
  })),
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';

import { normalizeApiError } from '../../types/api';
import { OrganizationListScreen } from './OrganizationListScreen';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: jest.fn() }) };
});

describe('OrganizationListScreen', () => {
  it('renders a safe error state when the organization dashboard query fails', async () => {
    const queryClient = new QueryClient();
    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <OrganizationListScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByText(normalizeApiError(new Error('Network Error')).message)).toBeTruthy();
  });
});
