import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminManagementScreen } from '../screens/admin/AdminManagementScreen';
import type { ManagementArea } from '../screens/admin/AdminManagementScreen';
import { AdminPaymentsScreen } from '../screens/admin/AdminPaymentsScreen';
import { AdminReportsScreen } from '../screens/admin/AdminReportsScreen';
import { OrganizationListScreen } from '../screens/admin/OrganizationListScreen';
import { colors } from '../theme';
import { RoleTabBar } from './RoleTabBar';

export type AdminTabParamList = {
  Dashboard: undefined;
  Organizations: undefined;
  Payments: undefined;
  Reports: undefined;
  Management: { initialArea?: ManagementArea } | undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
      }}
      tabBar={(props) => <RoleTabBar {...props} />}
    >
      <Tab.Screen component={AdminDashboardScreen} name="Dashboard" />
      <Tab.Screen component={OrganizationListScreen} name="Organizations" />
      <Tab.Screen component={AdminPaymentsScreen} name="Payments" />
      <Tab.Screen component={AdminReportsScreen} name="Reports" />
      <Tab.Screen name="Management" options={{ title: 'More' }}>
        {({ route }) => <AdminManagementScreen initialArea={route.params?.initialArea} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
