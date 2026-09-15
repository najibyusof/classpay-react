import { useQuery } from '@tanstack/react-query';

import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export const profileQueryKeys = {
  current: (userId: number | string) => ['auth', 'profile', userId] as const,
};

export function useProfile() {
  const sessionUser = useAuthStore((state) => state.user);

  return useQuery({
    enabled: sessionUser !== null,
    initialData: sessionUser ?? undefined,
    queryKey: profileQueryKeys.current(sessionUser?.id ?? 'anonymous'),
    queryFn: authApi.getCurrentUser,
    staleTime: 5 * 60_000,
  });
}
