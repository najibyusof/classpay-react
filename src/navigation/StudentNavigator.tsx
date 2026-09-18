import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';

import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { MyOrganizationsScreen } from '../screens/student/MyOrganizationsScreen';
import { StudentClassesScreen } from '../screens/student/StudentClassesScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { NotificationBell } from '../components';
import { colors } from '../theme';
import { RoleTabBar } from './RoleTabBar';
import { registerPushDestinationHandler } from '../services/pushNavigationEvents';
import { ProfileScreen } from '../screens/account/ProfileScreen';
import { AccountSettingsScreen } from '../screens/account/AccountSettingsScreen';

export type StudentTabParamList = {
  Dashboard: undefined;
  Classes: undefined;
  MyOrganizations: undefined;
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
      <Tab.Screen
        component={StudentDashboardScreen}
        name="Dashboard"
        options={{ title: 'Utama' }}
      />
      <Tab.Screen
        component={StudentClassesScreen}
        name="Classes"
        options={{ title: 'Kelas' }}
      />
      <Tab.Screen
        component={MyOrganizationsScreen}
        name="MyOrganizations"
        options={{ title: 'Organisasi' }}
      />
      <Tab.Screen
        component={NotificationsScreen}
        name="Notifications"
        options={{ title: 'Notifikasi' }}
      />
      <Tab.Screen component={ProfileScreen} name="Profile" options={{ title: 'Profil' }} />
      <Tab.Screen component={AccountSettingsScreen} name="Settings" options={{ title: 'Tetapan' }} />
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
