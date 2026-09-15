import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '../../components';
import { colors, spacing, typography } from '../../theme';

export function SplashScreen() {
  return (
    <View accessibilityLabel="Restoring your session" style={styles.container}>
      <BrandLogo size={88} />
      <Text style={styles.brand}>ClassPay</Text>
      <Text style={styles.tagline}>Education made easier</Text>
      <ActivityIndicator
        accessibilityLabel="Loading"
        color={colors.primary}
        size="small"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  brand: { ...typography.display, color: colors.text, marginTop: spacing.md },
  tagline: { ...typography.body, color: colors.mutedText, marginTop: spacing.xxs },
  loader: { marginTop: spacing.xxxl },
});
