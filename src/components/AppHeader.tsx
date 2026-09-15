import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface HeaderAction {
  icon: IconName;
  label: string;
  onPress: () => void;
}

interface AppHeaderProps {
  title: string;
  onBackPress?: () => void;
  actions?: readonly HeaderAction[];
  leading?: ReactNode;
}

export function AppHeader({ title, onBackPress, actions = [], leading }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
      <View style={styles.side}>
        {leading ??
          (onBackPress ? (
            <HeaderIconButton icon="arrow-back" label="Go back" onPress={onBackPress} />
          ) : null)}
      </View>
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <View style={[styles.side, styles.actions]}>
        {actions.map((action) => (
          <HeaderIconButton
            key={action.label}
            icon={action.icon}
            label={action.label}
            onPress={action.onPress}
          />
        ))}
      </View>
    </View>
  );
}

function HeaderIconButton({ icon, label, onPress }: HeaderAction) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={spacing.xs}
      onPress={onPress}
      style={styles.iconButton}
    >
      <Ionicons color={colors.text} name={icon} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  side: { alignItems: 'center', flexDirection: 'row', minWidth: 40 },
  actions: { justifyContent: 'flex-end' },
  title: { ...typography.title, color: colors.text, flex: 1, textAlign: 'center' },
  iconButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
});
