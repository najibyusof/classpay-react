import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';

import { SponsorDashboardScreen } from '../screens/sponsor/SponsorDashboardScreen';
import { PaymentScheduleListScreen } from '../screens/payment-schedules/PaymentScheduleListScreen';
import { PaymentHistoryScreen } from '../screens/payment-history/PaymentHistoryScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { NotificationBell } from '../components';
import { colors } from '../theme';
import { RoleTabBar } from './RoleTabBar';
import { registerPushDestinationHandler } from '../services/pushNavigationEvents';
import { ProfileScreen } from '../screens/account/ProfileScreen';
import { AccountSettingsScreen } from '../screens/account/AccountSettingsScreen';

export type SponsorTabParamList = {
  Dashboard: undefined;
  SponsoredPaymentSchedules: undefined;
  PaymentHistory: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<SponsorTabParamList>();

function SponsorPaymentSchedulesScreen() {
  return <PaymentScheduleListScreen audience="sponsor" />;
}

function SponsorPaymentHistoryScreen() {
  return <PaymentHistoryScreen audience="sponsor" />;
}

export function SponsorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerRight: () => (
          <NotificationBell onPress={() => navigation.navigate('Notifications')} />
        ),
      })}
      tabBar={(props) => <SponsorTabBar {...props} />}
    >
      <Tab.Screen component={SponsorDashboardScreen} name="Dashboard" />
      <Tab.Screen
        component={SponsorPaymentSchedulesScreen}
        name="SponsoredPaymentSchedules"
        options={{ title: 'Schedules' }}
      />
      <Tab.Screen
        component={SponsorPaymentHistoryScreen}
        name="PaymentHistory"
        options={{ title: 'History' }}
      />
      <Tab.Screen
        component={NotificationsScreen}
        name="Notifications"
        options={{ title: 'Alerts' }}
      />
      <Tab.Screen component={ProfileScreen} name="Profile" />
      <Tab.Screen component={AccountSettingsScreen} name="Settings" />
    </Tab.Navigator>
  );
}

function SponsorTabBar({ navigation, ...props }: BottomTabBarProps) {
  useEffect(
    () =>
      registerPushDestinationHandler((destination) => {
        navigation.navigate(
          destination.screen === 'PaymentScheduleDetail'
            ? 'SponsoredPaymentSchedules'
            : destination.screen === 'PaymentDetail'
              ? 'PaymentHistory'
              : 'Notifications',
        );
      }),
    [navigation],
  );
  return <RoleTabBar navigation={navigation} {...props} />;
}
