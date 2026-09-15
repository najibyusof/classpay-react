import Constants, { AppOwnership } from 'expo-constants';
import { Platform } from 'react-native';

export const isRunningInExpoGo = Constants.appOwnership === AppOwnership.Expo;
export const isRunningOnWeb = Platform.OS === 'web';
