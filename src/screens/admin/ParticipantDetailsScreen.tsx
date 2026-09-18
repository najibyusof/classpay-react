import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { adminApi } from '../../api/adminApi';
import { AppHeader, Button, ErrorState, TextInput } from '../../components';
import { colors, spacing, typography } from '../../theme';
import type { AdminParticipant } from '../../types/admin';
import { confirmAction } from '../../utils/confirmAction';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter the name').max(150, 'Name is too long'),
  phone: z.string().trim().min(1, 'Enter a phone number'),
  email: z.string().trim().email('Enter a valid email address').or(z.literal('')),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ParticipantDetailsScreen({
  onBack,
  onUpdated,
  participant,
  onViewPayments,
  startEditing = false,
}: {
  onBack: () => void;
  onUpdated: () => void;
  participant: AdminParticipant;
  onViewPayments: () => void;
  startEditing?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(startEditing);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const role = participant.participant_type?.toLowerCase() === 'sponsor' ? 'sponsor' : 'student';
  const person = participant.user;
  const { control, handleSubmit, formState: { errors } } = useForm<ProfileValues>({
    defaultValues: { email: person?.email ?? '', name: person?.name ?? participant.name ?? '', phone: person?.phone ?? participant.phone ?? '' },
    resolver: zodResolver(profileSchema),
  });

  const saveProfile = handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const payload = { email: values.email.trim() || null, name: values.name.trim(), phone: values.phone.trim() };
      if (role === 'sponsor') await adminApi.updateAdminSponsor(person?.id ?? participant.user_id ?? participant.id, payload);
      else await adminApi.updateAdminStudent(person?.id ?? participant.user_id ?? participant.id, payload);
      Alert.alert('Profile updated', 'The user profile has been updated.', [
        { text: 'Done', onPress: () => { setIsEditing(false); onUpdated(); } },
      ]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The profile could not be updated.');
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <View style={styles.flex}>
      <AppHeader onBackPress={onBack} title="User Details" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{role === 'sponsor' ? 'Sponsor' : 'Student'} details</Text>
        <Text style={styles.className}>Class participant</Text>
        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        {isEditing ? (
          <View style={styles.form}>
            <Controller control={control} name="name" render={({ field: { onBlur, onChange, value } }) => <TextInput autoCapitalize="words" error={errors.name?.message} label="Name *" onBlur={onBlur} onChangeText={onChange} value={value} />} />
            <Controller control={control} name="phone" render={({ field: { onBlur, onChange, value } }) => <TextInput error={errors.phone?.message} keyboardType="phone-pad" label="Phone Number *" onBlur={onBlur} onChangeText={onChange} value={value} />} />
            <Controller control={control} name="email" render={({ field: { onBlur, onChange, value } }) => <TextInput autoCapitalize="none" error={errors.email?.message} keyboardType="email-address" label="Email" onBlur={onBlur} onChangeText={onChange} value={value} />} />
            <Button disabled={isSaving} label="Update Profile" loading={isSaving} onPress={() => confirmAction({ confirmLabel: 'Update', message: 'Update this user profile?', onConfirm: () => void saveProfile(), title: 'Confirm update' })} variant="brand" />
          </View>
        ) : (
          <View style={styles.profileCard}>
            <DetailRow label="Name" value={person?.name ?? participant.name ?? '--'} />
            <DetailRow label="Phone" value={person?.phone ?? participant.phone ?? '--'} />
            <DetailRow label="Email" value={person?.email ?? '--'} />
            <Button label="View Payments" onPress={onViewPayments} variant="outline" />
            <Button label="Update Profile" onPress={() => setIsEditing(true)} variant="outline" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.md, padding: spacing.md },
  title: { ...typography.heading, color: colors.text },
  className: { ...typography.bodySmall, color: colors.mutedText },
  profileCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  form: { gap: spacing.md },
  row: { borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  label: { ...typography.bodySmall, color: colors.mutedText },
  value: { ...typography.bodySmall, color: colors.text, fontWeight: '600', textAlign: 'right' },
});
