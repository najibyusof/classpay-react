import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';

import { adminApi } from '../api/adminApi';
import { colors, radius } from '../theme';
import { isTrustedHttpsUrl } from '../utils/url';

interface OrganizationLogoProps {
  organizationId: number | string;
  color?: string;
  size?: 'md' | 'lg';
}

export function OrganizationLogo({ organizationId, color = colors.info, size = 'md' }: OrganizationLogoProps) {
  const logoQuery = useQuery({
    queryKey: ['admin', 'organizations', organizationId, 'logo'],
    queryFn: () => adminApi.getOrganizationLogoUrl(organizationId),
    staleTime: 5 * 60_000,
  });
  const logoUrl = logoQuery.data ?? undefined;
  const sizeStyle = sizes[size];

  if (isTrustedHttpsUrl(logoUrl)) {
    return <Image accessibilityLabel="Organization logo" source={{ uri: logoUrl }} style={[styles.image, sizeStyle]} />;
  }

  return (
    <View style={[styles.fallback, sizeStyle, { backgroundColor: `${color}18` }]}>
      <Ionicons color={color} name="business" size={size === 'lg' ? 28 : 23} />
    </View>
  );
}

const sizes = {
  md: { height: 42, width: 42 },
  lg: { height: 52, width: 52 },
} as const;

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  image: { borderRadius: radius.md },
});
