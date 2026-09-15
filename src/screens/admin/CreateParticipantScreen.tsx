import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import { AppHeader, Button, ErrorState, TextInput } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import type { AddClassParticipantRequest } from '../../types/admin';

const DEFAULT_PARTICIPANT_PASSWORD = 'password';

export const createParticipantSchema = z.object({
  name: z.string().trim().min(1, 'Enter the name').max(150, 'Name is too long'),
  phone: z.string().trim().min(1, 'Enter a phone number'),
  email: z
    .string()
    .trim()
    .max(150, 'Email is too long')
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: 'Enter a valid email address',
    }),
});

type CreateParticipantFormValues = z.infer<typeof createParticipantSchema>;

const apiFieldToFormField: Record<string, keyof CreateParticipantFormValues> = {
  name: 'name',
  phone: 'phone',
  email: 'email',
};

export function CreateParticipantScreen({
  classId,
  className,
  onBack,
  onCreated,
  participantType,
}: {
  classId: number | string;
  className: string;
  onBack: () => void;
  onCreated: () => void;
  participantType: AddClassParticipantRequest['participant_type'];
}) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateParticipantFormValues>({
    defaultValues: { email: '', name: '', phone: '' },
    resolver: zodResolver(createParticipantSchema),
  });

  const roleLabel = participantType === 'student' ? 'Student' : 'Sponsor';

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const registration = await authApi.register({
        device_name: '-',
        email: values.email.trim() || undefined,
        name: values.name.trim(),
        password: DEFAULT_PARTICIPANT_PASSWORD,
        password_confirmation: DEFAULT_PARTICIPANT_PASSWORD,
        phone: values.phone.trim(),
        user_type: participantType,
      });
      try {
        await adminApi.addClassParticipant(classId, {
          participant_type: participantType,
          user_id: registration.user.id,
        });
      } catch (error) {
        setErrorMessage(
          `${roleLabel} was created but could not be added to the class: ${toApiError(error).message}`,
        );
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'classes', classId, 'participants'],
      });
      Alert.alert(
        `${roleLabel} created`,
        `${registration.user.name} was added to ${className}.`,
        [{ text: 'Done', onPress: onCreated }],
      );
    } catch (error) {
      const apiError = toApiError(error);
      setErrorMessage(apiError.message);
      Object.entries(apiError.fieldErrors).forEach(([field, messages]) => {
        const formField = apiFieldToFormField[field];
        const message = messages[0];
        if (formField && message) setError(formField, { message, type: 'server' });
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <View style={styles.flex}>
      <AppHeader onBackPress={onBack} title={`Create New ${roleLabel}`} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>New {participantType}</Text>
        <Text style={styles.className}>Class: {className}</Text>
        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                autoCapitalize="words"
                error={errors.name?.message}
                label="Name *"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. Ahmad Daniel"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                error={errors.phone?.message}
                keyboardType="phone-pad"
                label="Phone Number *"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. +60123456789"
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
                error={errors.email?.message}
                keyboardType="email-address"
                label="Email"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. sponsor@example.com"
                value={value}
              />
            )}
          />
        </View>
        <Button
          disabled={isSubmitting}
          label={`Create ${roleLabel}`}
          loading={isSubmitting}
          onPress={onSubmit}
          testID="create-participant-submit"
          variant="brand"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.lg, padding: spacing.lg },
  title: { ...typography.heading, color: colors.text, fontSize: 22 },
  className: { ...typography.bodySmall, color: colors.mutedText },
  form: { gap: spacing.md },
});
