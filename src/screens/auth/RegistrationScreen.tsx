import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { Button, ErrorState, PasswordInput, TextInput } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme';
import type { RegistrationUserType } from '../../types/auth';
import { confirmAction } from '../../utils/confirmAction';
import { normalizeMalaysianPhoneNumber } from '../../utils/phone';

export const registrationSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your full name').max(150, 'Name is too long'),
    phone: z
      .string()
      .trim()
      .min(1, 'Enter your phone number')
      .refine(
        (value) => normalizeMalaysianPhoneNumber(value) !== null,
        'Enter a valid Malaysian phone number',
      ),
    email: z
      .string()
      .trim()
      .refine((value) => value === '' || z.email().safeParse(value).success, 'Enter a valid email')
      .optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirmation: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const roleOptions: Array<{ label: string; value: RegistrationUserType }> = [
  { label: 'Admin', value: 'admin' },
  { label: 'Student', value: 'student' },
  { label: 'Sponsor', value: 'sponsor' },
];

const roleCopy: Record<RegistrationUserType, { title: string }> = {
  admin: { title: 'Create Account' },
  student: { title: 'Create Account' },
  sponsor: { title: 'Create Account' },
};

export function RegistrationScreen({ onBack }: { onBack: () => void }) {
  const [role, setRole] = useState<RegistrationUserType>('admin');
  const register = useAuthStore((state) => state.register);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const clearError = useAuthStore((state) => state.clearError);
  const isRegistering = useAuthStore((state) => state.isRegistering);
  const validationErrors = useAuthStore((state) => state.validationErrors);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    defaultValues: { email: '', name: '', password: '', passwordConfirmation: '', phone: '' },
    resolver: zodResolver(registrationSchema),
  });

  useEffect(() => clearError, [clearError]);

  const createAccount = async (values: RegistrationFormValues) => {
    const phone = normalizeMalaysianPhoneNumber(values.phone);
    if (!phone) return;

    const didRegister = await register({
      device_name: 'mobile-app',
      email: values.email?.trim() || undefined,
      name: values.name.trim(),
      password: values.password,
      password_confirmation: values.passwordConfirmation,
      phone,
      user_type: role,
    });
    if (didRegister) {
      Alert.alert(
        'Registration successful',
        'Your account has been created. Please log in to continue.',
        [{ text: 'Log in', onPress: onBack }],
      );
    }
  };

  const onSubmit = handleSubmit((values) =>
    confirmAction({
      confirmLabel: 'Create',
      message: 'Create this account?',
      onConfirm: () => void createAccount(values),
      title: 'Confirm create',
    }),
  );

  const copy = roleCopy[role];
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
          <Text style={styles.title}>{copy.title}</Text>
        </View>

        <View accessibilityRole="tablist" style={styles.roleSelector}>
          {roleOptions.map((option) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: role === option.value }}
              key={option.value}
              onPress={() => setRole(option.value)}
              style={[styles.roleOption, role === option.value && styles.roleOptionActive]}
            >
              <Text style={[styles.roleLabel, role === option.value && styles.roleLabelActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                autoComplete="name"
                error={errors.name?.message ?? validationErrors.name?.[0]}
                label="Full name"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Your full name"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                autoComplete="tel"
                error={errors.phone?.message ?? validationErrors.phone?.[0]}
                keyboardType="phone-pad"
                label="Phone number"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="0123456789"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                autoComplete="email"
                error={errors.email?.message ?? validationErrors.email?.[0]}
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
                error={errors.password?.message ?? validationErrors.password?.[0]}
                label="Password"
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
                error={
                  errors.passwordConfirmation?.message ??
                  validationErrors.password_confirmation?.[0]
                }
                label="Confirm password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        <Button
          icon="person-add-outline"
          label="Create account"
          loading={isRegistering}
          onPress={onSubmit}
          testID="registration-submit"
          variant="brand"
        />
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.loginLink}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <Text style={styles.loginAction}>Log in</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { flexGrow: 1, gap: spacing.md, padding: spacing.lg, paddingTop: spacing.xl },
  header: { gap: spacing.xs },
  backButton: { alignSelf: 'flex-start', marginBottom: spacing.sm },
  title: { ...typography.heading, color: colors.text, fontSize: 28 },
  subtitle: { ...typography.bodySmall, color: colors.mutedText },
  roleSelector: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    flexDirection: 'row',
    padding: spacing.xxs,
  },
  roleOption: { borderRadius: radius.md, flex: 1, paddingVertical: spacing.sm },
  roleOptionActive: { backgroundColor: colors.surface },
  roleLabel: { ...typography.label, color: colors.mutedText, textAlign: 'center' },
  roleLabelActive: { color: colors.primary },
  form: { gap: spacing.sm },
  loginLink: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  loginPrompt: { ...typography.bodySmall, color: colors.mutedText },
  loginAction: { ...typography.label, color: colors.primary },
});
