import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { authApi } from '../../api/authApi';
import { Button, ErrorState, PasswordInput, TextInput } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import { confirmAction } from '../../utils/confirmAction';

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, 'Enter the reset token from your email'),
    email: z.string().trim().email('Enter a valid email address'),
    password: z.string().min(8, 'Use at least 8 characters'),
    passwordConfirmation: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordScreen({ onBack }: { onBack: () => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { email: '', password: '', passwordConfirmation: '', token: '' },
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        email: values.email.trim(),
        password: values.password,
        password_confirmation: values.passwordConfirmation,
        token: values.token.trim(),
      });
      Alert.alert('Password reset successful', 'Your password has been updated. Please log in.', [
        { text: 'Log in', onPress: onBack },
      ]);
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Back to login"
            accessibilityRole="button"
            hitSlop={spacing.sm}
            onPress={onBack}
            style={styles.backButton}
          >
            <Ionicons color={colors.text} name="arrow-back" size={24} />
          </Pressable>
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>Use the reset token sent to your email.</Text>
        </View>

        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        <View style={styles.form}>
          <Controller
            control={control}
            name="token"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.token?.message}
                label="Reset token"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Paste the token from your email"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                error={errors.email?.message}
                keyboardType="email-address"
                label="Email"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="you@example.com"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onBlur, onChange, value } }) => (
              <PasswordInput
                autoComplete="new-password"
                error={errors.password?.message}
                label="New password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="passwordConfirmation"
            render={({ field: { onBlur, onChange, value } }) => (
              <PasswordInput
                autoComplete="new-password"
                error={errors.passwordConfirmation?.message}
                label="Confirm new password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
        <Button
          disabled={isSubmitting}
          icon="lock-open-outline"
          label="Reset password"
          loading={isSubmitting}
          onPress={() =>
            confirmAction({
              confirmLabel: 'Reset',
              message: 'Reset this account password?',
              onConfirm: onSubmit,
              title: 'Confirm update',
            })
          }
          testID="reset-password-submit"
          variant="brand"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { flexGrow: 1, gap: spacing.lg, justifyContent: 'center', padding: spacing.lg },
  header: { gap: spacing.xs },
  backButton: { alignSelf: 'flex-start', marginBottom: spacing.sm },
  title: { ...typography.heading, color: colors.text, fontSize: 28 },
  subtitle: { ...typography.bodySmall, color: colors.mutedText },
  form: { gap: spacing.md },
});
