import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { authApi } from '../../api/authApi';
import { Button, ErrorState, PasswordInput } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters'),
    passwordConfirmation: z.string().min(1, 'Confirm your password'),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function InitialPasswordScreen() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const completePasswordSetup = useAuthStore((state) => state.completePasswordSetup);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    defaultValues: { password: '', passwordConfirmation: '' },
    resolver: zodResolver(passwordSchema),
  });
  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await authApi.setPassword({
        password: values.password,
        password_confirmation: values.passwordConfirmation,
      });
      completePasswordSetup();
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.intro}>
        <Text style={styles.title}>Set your password</Text>
        <Text style={styles.subtitle}>Create a password to protect your ClassPay account.</Text>
      </View>
      {errorMessage ? <ErrorState message={errorMessage} /> : null}
      <View style={styles.form}>
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
              label="Confirm password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>
      <Button
        disabled={isSubmitting}
        label="Set password"
        loading={isSubmitting}
        onPress={onSubmit}
      />
      <Button
        disabled={isSubmitting}
        label="Sign out"
        onPress={() => void clearSession()}
        variant="ghost"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, gap: spacing.lg, justifyContent: 'center', padding: spacing.xl },
  intro: { gap: spacing.xs },
  title: { ...typography.heading, color: colors.text },
  subtitle: { ...typography.body, color: colors.mutedText },
  form: { gap: spacing.md },
});
