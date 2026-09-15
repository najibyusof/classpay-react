import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, BrandLogo, Button, EmptyState } from '../../components';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing } from '../../theme';

export function AppShellScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const logout = useAuthStore((state) => state.logout);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);

  return (
    <View style={styles.container}>
      <AppHeader
        actions={[
          {
            icon: 'key-outline',
            label: 'Change password',
            onPress: () => navigation.navigate('ChangePassword'),
          },
        ]}
        title="ClassPay"
      />
      <View style={styles.brandBlock}>
        <BrandLogo size={56} />
        <Text style={styles.wordmark}>ClassPay</Text>
      </View>
      <EmptyState
        title="Application setup complete"
        description="Features will be added in future phases."
      />
      <View style={styles.logout}>
        <Button
          disabled={isLoggingOut}
          label="Sign out"
          loading={isLoggingOut}
          onPress={() => void logout()}
          variant="outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  wordmark: { color: colors.primary, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  brandBlock: { alignItems: 'center', marginTop: spacing.xl },
  logout: { padding: spacing.xl },
});
