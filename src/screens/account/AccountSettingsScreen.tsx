import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, LogoutConfirmation } from '../../components';
import { ChangePasswordScreen } from '../auth/ChangePasswordScreen';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';

export function AccountSettingsScreen() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const logout = useAuthStore((state) => state.logout);

  if (isChangingPassword)
    return <ChangePasswordScreen onBack={() => setIsChangingPassword(false)} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account settings</Text>
      <Button
        label="Change password"
        onPress={() => setIsChangingPassword(true)}
        variant="outline"
      />
      <Button label="Sign out" onPress={() => setIsLogoutVisible(true)} variant="danger" />
      <LogoutConfirmation
        isLoggingOut={isLoggingOut}
        onCancel={() => setIsLogoutVisible(false)}
        onConfirm={() => void logout()}
        visible={isLogoutVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, gap: spacing.md, padding: spacing.md },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.xs },
});
