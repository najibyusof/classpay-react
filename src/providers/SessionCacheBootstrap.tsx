import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../store/authStore';

export function SessionCacheBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isHydrating && !accessToken) queryClient.clear();
  }, [accessToken, isHydrating, queryClient]);

  return null;
}
