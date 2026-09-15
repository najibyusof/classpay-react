import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'classpay.access-token';
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};
let webAccessToken: string | null = null;

export const tokenStorage = {
  getAccessToken: () =>
    Platform.OS === 'web'
      ? Promise.resolve(webAccessToken)
      : SecureStore.getItemAsync(ACCESS_TOKEN_KEY, secureStoreOptions),
  setAccessToken: (accessToken: string) => {
    if (Platform.OS === 'web') {
      webAccessToken = accessToken;
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken, secureStoreOptions);
  },
  clearAccessToken: () => {
    if (Platform.OS === 'web') {
      webAccessToken = null;
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY, secureStoreOptions);
  },
};
