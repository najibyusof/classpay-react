import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';

import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { PaymentScheduleListScreen } from '../screens/payment-schedules/PaymentScheduleListScreen';
import { PaymentHistoryScreen } from '../screens/payment-history/PaymentHistoryScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { NotificationBell } from '../components';
import { colors } from '../theme';
import { RoleTabBar } from './RoleTabBar';
import { registerPushDestinationHandler } from '../services/pushNavigationEvents';
import { ProfileScreen } from '../screens/account/ProfileScreen';
import { AccountSettingsScreen } from '../screens/account/AccountSettingsScreen';

export type StudentTabParamList = {
  Dashboard: undefined;
  PaymentSchedules: undefined;
  PaymentHistory: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();

export function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerRight: () => (
          <NotificationBell onPress={() => navigation.navigate('Notifications')} />
        ),
      })}
      tabBar={(props) => <StudentTabBar {...props} />}
    >
      <Tab.Screen component={StudentDashboardScreen} name="Dashboard" />
      <Tab.Screen
        component={() => <PaymentScheduleListScreen audience="student" />}
        name="PaymentSchedules"
        options={{ title: 'Schedules' }}
      />
      <Tab.Screen
        component={() => <PaymentHistoryScreen audience="student" />}
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

function StudentTabBar({ navigation, ...props }: BottomTabBarProps) {
  useEffect(
    () =>
      registerPushDestinationHandler((destination) => {
        navigation.navigate(
          destination.screen === 'PaymentScheduleDetail'
            ? 'PaymentSchedules'
            : destination.screen === 'PaymentDetail'
              ? 'PaymentHistory'
              : 'Notifications',
        );
      }),
    [navigation],
  );
  return <RoleTabBar navigation={navigation} {...props} />;
}
