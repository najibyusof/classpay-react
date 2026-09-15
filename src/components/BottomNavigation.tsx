import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface BottomNavigationItem<Key extends string> {
  key: Key;
  label: string;
  icon: IconName;
}

interface BottomNavigationProps<Key extends string> {
  items: readonly BottomNavigationItem<Key>[];
  activeKey: Key;
  onSelect: (key: Key) => void;
}

export function BottomNavigation<Key extends string>({
  items,
  activeKey,
  onSelect,
}: BottomNavigationProps<Key>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.navigation, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const color = isActive ? colors.primary : colors.mutedText;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={item.key}
            onPress={() => onSelect(item.key)}
            style={styles.item}
          >
            <Ionicons color={color} name={item.icon} size={22} />
            <Text
              adjustsFontSizeToFit
              allowFontScaling={false}
              ellipsizeMode="clip"
              numberOfLines={1}
              style={[styles.label, { color }]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navigation: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
  },
  item: {
    alignItems: 'center',
    minWidth: 0,
    flex: 1,
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: 56,
  },
  label: {
    ...typography.caption,
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
