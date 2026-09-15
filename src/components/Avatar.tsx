import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '../theme';
import { isTrustedHttpsUrl } from '../utils/url';

interface AvatarProps {
  name: string;
  imageUri?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, imageUri, size = 'md' }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const sizeStyle = avatarSizes[size];

  if (isTrustedHttpsUrl(imageUri)) {
    return (
      <Image
        accessibilityLabel={`${name} profile photo`}
        source={{ uri: imageUri }}
        style={[styles.image, sizeStyle]}
      />
    );
  }

  return (
    <View accessibilityLabel={`${name} avatar`} style={[styles.fallback, sizeStyle]}>
      <Text style={[styles.initials, size === 'sm' && styles.initialsSmall]}>
        {initials || '?'}
      </Text>
    </View>
  );
}

const avatarSizes = {
  sm: { height: 32, width: 32 },
  md: { height: 40, width: 40 },
  lg: { height: 56, width: 56 },
} as const;

const styles = StyleSheet.create({
  image: { borderRadius: radius.pill },
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  initials: { ...typography.label, color: colors.primary },
  initialsSmall: { ...typography.caption, color: colors.primary },
});
