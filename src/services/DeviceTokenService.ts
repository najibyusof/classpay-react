import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { DeviceToken } from '../types/push';

export interface DeviceTokenRegistrar {
  register: (token: DeviceToken) => Promise<void>;
}

export const pendingDeviceTokenRegistrar: DeviceTokenRegistrar = {
  register: async () => {
    // Pending backend confirmation: no device-token endpoint is currently documented.
  },
};

export const DeviceTokenService = {
  requestPermissionAndGetToken: async (): Promise<DeviceToken | null> => {
    if (!Device.isDevice || (Platform.OS !== 'android' && Platform.OS !== 'ios')) return null;

    const existingPermissions = await Notifications.getPermissionsAsync();
    const permission = existingPermissions.granted
      ? existingPermissions
      : await Notifications.requestPermissionsAsync();
    if (!permission.granted) return null;

    const token = await Notifications.getDevicePushTokenAsync();
    if (typeof token.data !== 'string') return null;
    if (token.type !== 'android' && token.type !== 'ios') return null;
    return { platform: token.type, value: token.data };
  },
  registerCurrentDevice: async (registrar: DeviceTokenRegistrar = pendingDeviceTokenRegistrar) => {
    const token = await DeviceTokenService.requestPermissionAndGetToken();
    if (token) await registrar.register(token);
    return token;
  },
};
