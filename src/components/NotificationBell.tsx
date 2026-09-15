import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useUnreadNotificationCount } from '../hooks/useNotifications';
import { colors, spacing } from '../theme';
import { UnreadBadge } from './UnreadBadge';

interface NotificationBellProps {
  onPress: () => void;
}

export function NotificationBell({ onPress }: NotificationBellProps) {
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <Pressable
      accessibilityLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      accessibilityRole="button"
      hitSlop={spacing.xs}
      onPress={onPress}
      style={styles.button}
    >
      <Ionicons color={colors.text} name="notifications-outline" size={22} />
      <View style={styles.badge}>
        <UnreadBadge count={unreadCount} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  badge: { position: 'absolute', right: 0, top: 1 },
});
