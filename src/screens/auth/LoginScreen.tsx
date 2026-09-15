import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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

import { BrandLogo, Button, ErrorState, PasswordInput, TextInput } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';
import { normalizeMalaysianPhoneNumber } from '../../utils/phone';

export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, 'Enter your phone number')
    .refine(
      (value) => normalizeMalaysianPhoneNumber(value) !== null,
      'Enter a valid Malaysian phone number',
    ),
  password: z.string().min(1, 'Enter your password'),
  deviceName: z.string().trim().min(1, 'Enter this device name'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginScreen({
  onForgotPassword,
  onRegister = () => undefined,
}: {
  onForgotPassword?: () => void;
  onRegister?: () => void;
}) {
  const [selectedMode, setSelectedMode] = useState<'student' | 'admin'>('student');
  const login = useAuthStore((state) => state.login);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);
  const validationErrors = useAuthStore((state) => state.validationErrors);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      deviceName: '',
      password: '',
      phone: '',
    },
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => clearError, [clearError]);

  const onSubmit = handleSubmit(async (values) => {
    const phone = normalizeMalaysianPhoneNumber(values.phone);
    if (!phone) {
      return;
    }
    await login({ device_name: values.deviceName, password: values.password, phone });
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <BrandLogo size={64} />
          <Text style={styles.brand}>ClassPay</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Please enter your phone number and password to sign in.
          </Text>
        </View>
        <View accessibilityRole="tablist" style={styles.modeSelector}>
          <ModeButton
            active={selectedMode === 'student'}
            label="Student"
            onPress={() => setSelectedMode('student')}
          />
          <ModeButton
            active={selectedMode === 'admin'}
            label="Admin"
            onPress={() => setSelectedMode('admin')}
          />
        </View>
        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        <LoginFields control={control} errors={errors} validationErrors={validationErrors} />
        <Pressable
          accessibilityLabel="Forgot password?"
          accessibilityRole="button"
          onPress={
            onForgotPassword ??
            (() =>
              Alert.alert(
                'Password recovery unavailable',
                'Please contact your administrator to reset your password.',
              ))
          }
          style={styles.forgotPasswordLink}
          testID="forgot-password-link"
        >
          <Text style={styles.forgotPasswordLabel}>Forgot password?</Text>
        </Pressable>
        <Button
          disabled={isLoggingIn}
          icon="arrow-forward"
          label="Sign In"
          loading={isLoggingIn}
          onPress={onSubmit}
          testID="login-submit"
          variant="brand"
        />
        <Pressable accessibilityRole="button" onPress={onRegister} style={styles.registerLink}>
          <Text style={styles.registerPrompt}>Don't have an account? </Text>
          <Text style={styles.registerAction}>Create one</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ModeButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Text
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.modeLabel, active && styles.modeLabelActive]}
    >
      {label}
    </Text>
  );
}

function LoginFields({
  control,
  errors,
  validationErrors,
}: {
  control: ReturnType<typeof useForm<LoginFormValues>>['control'];
  errors: ReturnType<typeof useForm<LoginFormValues>>['formState']['errors'];
  validationErrors: Record<string, string[]>;
}) {
  return (
    <View style={styles.form}>
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
        name="password"
        render={({ field: { onBlur, onChange, value } }) => (
          <PasswordInput
            autoComplete="current-password"
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
        name="deviceName"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            error={errors.deviceName?.message ?? validationErrors.device_name?.[0]}
            label="Device name"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={Platform.OS === 'ios' ? 'e.g. iPhone 15 Pro' : 'e.g. Android device'}
            value={value}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { backgroundColor: '#FAF9FF', flex: 1 },
  container: { flexGrow: 1, gap: spacing.md, justifyContent: 'center', padding: spacing.lg },
  intro: { alignItems: 'center', gap: spacing.xs },
  brand: { ...typography.heading, color: '#111827', marginBottom: spacing.lg },
  title: { ...typography.heading, alignSelf: 'stretch', color: '#111827', fontSize: 28 },
  subtitle: { ...typography.bodySmall, alignSelf: 'stretch', color: '#505168' },
  modeSelector: { backgroundColor: '#E9EBFF', borderRadius: 24, flexDirection: 'row', padding: 4 },
  modeLabel: {
    ...typography.label,
    color: '#505168',
    flex: 1,
    paddingVertical: spacing.xs,
    textAlign: 'center',
  },
  modeLabelActive: { backgroundColor: colors.surface, borderRadius: 20, color: '#3327D6' },
  form: { gap: spacing.sm },
  forgotPasswordLink: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  forgotPasswordLabel: { ...typography.label, color: '#3327D6' },
  registerLink: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  registerPrompt: { ...typography.bodySmall, color: '#505168' },
  registerAction: { ...typography.label, color: '#3327D6' },
});
