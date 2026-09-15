import { useQuery } from '@tanstack/react-query';

import { adminApi } from '../api/adminApi';

export const adminQueryKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  organizations: ['admin', 'organizations'] as const,
  organization: (organizationId: number | string) =>
    ['admin', 'organization', organizationId] as const,
  organizationDashboard: (organizationId: number | string) =>
    ['admin', 'organizations', organizationId, 'dashboard'] as const,
  payments: ['admin', 'payments'] as const,
  reports: ['admin', 'reports'] as const,
};

export function useAdminOrganizations() {
  return useQuery({
    queryKey: adminQueryKeys.organizations,
    queryFn: () => adminApi.getOrganizations(1, 20),
  });
}

export function useAdminDashboard() {
  return useQuery({ queryKey: adminQueryKeys.dashboard, queryFn: adminApi.getDashboard });
}
