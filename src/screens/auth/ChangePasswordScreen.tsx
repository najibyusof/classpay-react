import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { authApi } from '../../api/authApi';
import { AppHeader, Button, ErrorState, PasswordInput, Snackbar } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    password: z.string().min(8, 'Use at least 8 characters'),
    passwordConfirmation: z.string().min(1, 'Confirm your new password'),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordScreen({ onBack }: { onBack: () => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: { currentPassword: '', password: '', passwordConfirmation: '' },
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        current_password: values.currentPassword,
        password: values.password,
        password_confirmation: values.passwordConfirmation,
      });
      reset();
      setIsSaved(true);
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <View style={styles.flex}>
      <AppHeader onBackPress={onBack} title="Change password" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.title}>Update your password</Text>
          <Text style={styles.subtitle}>
            Enter your current password, then choose a new password for your account.
          </Text>
        </View>
        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        <PasswordFields control={control} errors={errors} />
        <Button
          disabled={isSubmitting}
          label="Save password"
          loading={isSubmitting}
          onPress={onSubmit}
        />
      </ScrollView>
      <Snackbar
        message="Your password has been changed."
        onDismiss={() => setIsSaved(false)}
        tone="success"
        visible={isSaved}
      />
    </View>
  );
}

function PasswordFields({
  control,
  errors,
}: {
  control: ReturnType<typeof useForm<ChangePasswordFormValues>>['control'];
  errors: ReturnType<typeof useForm<ChangePasswordFormValues>>['formState']['errors'];
}) {
  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onBlur, onChange, value } }) => (
          <PasswordInput
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            label="Current password"
            onBlur={onBlur}
            onChangeText={onChange}
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
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { gap: spacing.lg, padding: spacing.xl },
  intro: { gap: spacing.xs },
  title: { ...typography.heading, color: colors.text },
  subtitle: { ...typography.body, color: colors.mutedText },
  form: { gap: spacing.md },
});
