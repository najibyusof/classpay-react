import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '../navigation/RootNavigator';
import { useAuthStore } from '../store/authStore';
import { ApiErrorHandler } from '../types/api';
import { PushNotificationBootstrap } from './PushNotificationBootstrap';
import { SessionCacheBootstrap } from './SessionCacheBootstrap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: ApiErrorHandler.canRetry,
      staleTime: 60_000,
    },
  },
});

function ApplicationRoot() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return <RootNavigator />;
}

export function AppProviders() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <SessionCacheBootstrap />
        <PushNotificationBootstrap />
        <ApplicationRoot />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
