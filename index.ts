import { registerRootComponent } from 'expo';

import { isRunningInExpoGo } from './src/utils/runtime';

import App from './App';

if (!isRunningInExpoGo) {
  void import('./src/services/PushNotificationService');
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
