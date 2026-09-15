import { Image, StyleSheet, View } from 'react-native';

interface BrandLogoProps {
  size?: number;
  accessibilityLabel?: string;
}

export function BrandLogo({ size = 72, accessibilityLabel = 'ClassPay logo' }: BrandLogoProps) {
  return (
    <View style={[styles.container, { height: size, width: size }]}>
      <Image
        accessibilityLabel={accessibilityLabel}
        resizeMode="contain"
        // React Native bundles local image assets through require().
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={require('../../assets/logo.png')}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  image: { height: '100%', width: '100%' },
});
