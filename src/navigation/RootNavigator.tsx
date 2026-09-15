import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';

import { ChangePasswordScreen } from '../screens/auth/ChangePasswordScreen';
import { SetPasswordScreen } from '../screens/auth/SetPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegistrationScreen } from '../screens/auth/RegistrationScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { AdminNavigator } from './AdminNavigator';
import { getAuthenticationRoute } from './authNavigation';
import { isSupportedUserType } from './roleNavigation';
import { SponsorNavigator } from './SponsorNavigator';
import { StudentNavigator } from './StudentNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Registration: undefined;
  ResetPassword: undefined;
  InitialPassword: undefined;
  StudentApp: undefined;
  SponsorApp: undefined;
  AdminApp: undefined;
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const requiresPasswordSetup = useAuthStore((state) => state.requiresPasswordSetup);
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);
  const route = getAuthenticationRoute({ isHydrating, requiresPasswordSetup, user });

  useEffect(() => {
    if (!isHydrating && user && !isSupportedUserType(user.user_type)) {
      void clearSession();
    }
  }, [clearSession, isHydrating, user]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        {route === 'Splash' ? <Stack.Screen component={SplashScreen} name="Splash" /> : null}
        {route === 'Login' ? (
          <>
            <Stack.Screen name="Login">
              {({ navigation }) => (
                <LoginScreen
                  onForgotPassword={() => navigation.navigate('ResetPassword')}
                  onRegister={() => navigation.navigate('Registration')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Registration">
              {({ navigation }) => <RegistrationScreen onBack={() => navigation.goBack()} />}
            </Stack.Screen>
            <Stack.Screen name="ResetPassword">
              {({ navigation }) => <ResetPasswordScreen onBack={() => navigation.goBack()} />}
            </Stack.Screen>
          </>
        ) : null}
        {route === 'InitialPassword' ? (
          <Stack.Screen component={SetPasswordScreen} name="InitialPassword" />
        ) : null}
        {route === 'StudentApp' ? (
          <Stack.Screen component={StudentNavigator} name="StudentApp" />
        ) : null}
        {route === 'SponsorApp' ? (
          <Stack.Screen component={SponsorNavigator} name="SponsorApp" />
        ) : null}
        {route === 'AdminApp' ? <Stack.Screen component={AdminNavigator} name="AdminApp" /> : null}
        {route !== 'Splash' && route !== 'Login' ? (
          <Stack.Screen component={ChangePasswordRoute} name="ChangePassword" />
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function ChangePasswordRoute() {
  const navigation = useNavigation();
  return <ChangePasswordScreen onBack={navigation.goBack} />;
}
