import type { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';

import { BottomNavigation } from '../components';

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabIcons: Record<string, IconName> = {
  Dashboard: 'home-outline',
  Management: 'people-outline',
  Notifications: 'notifications-outline',
  Organizations: 'business-outline',
  PaymentHistory: 'receipt-outline',
  Payments: 'receipt-outline',
  PaymentSchedules: 'calendar-outline',
  Profile: 'person-outline',
  Reports: 'bar-chart-outline',
  Settings: 'settings-outline',
  SponsoredPaymentSchedules: 'calendar-outline',
};

export function RoleTabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const activeRoute = state.routes[state.index] ?? state.routes[0];
  if (!activeRoute) {
    return null;
  }

  const items = state.routes.map((route) => ({
    icon: tabIcons[route.name] ?? 'ellipse-outline',
    key: route.name,
    label: descriptors[route.key]?.options.title ?? route.name,
  }));

  return (
    <BottomNavigation
      activeKey={activeRoute.name}
      items={items}
      onSelect={(routeName) => navigation.navigate(routeName)}
    />
  );
}
