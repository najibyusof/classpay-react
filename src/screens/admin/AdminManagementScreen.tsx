import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, LogoutConfirmation, Select, TextInput } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { adminApi } from '../../api/adminApi';
import { useAuthStore } from '../../store/authStore';
import { toApiError } from '../../types/api';
import type { AdminOrganization } from '../../types/admin';

type ManagementArea = 'organization' | 'class' | 'participants' | 'reminders';

interface AdminManagementScreenProps {
  initialArea?: ManagementArea;
  onBack?: () => void;
  onOrganizationCreated?: (organization: AdminOrganization) => void;
}

export function AdminManagementScreen({
  initialArea,
  onBack,
  onOrganizationCreated,
}: AdminManagementScreenProps) {
  const [activeArea, setActiveArea] = useState<ManagementArea | null>(initialArea ?? null);
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const logout = useAuthStore((state) => state.logout);

  if (activeArea) {
    return (
      <AdminFormShell
        area={activeArea}
        onOrganizationCreated={onOrganizationCreated}
        onBack={() => {
          if (onBack) onBack();
          else setActiveArea(null);
        }}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Management</Text>
      <EmptyState
        title="Management API pending"
        description="These areas will be enabled only when organization-scoped backend contracts are documented."
      />
      {managementAreas.map((area) => (
        <Card
          accessibilityLabel={`Open ${area.title}`}
          key={area.id}
          onPress={() => setActiveArea(area.id)}
        >
          <Text style={styles.label}>{area.title}</Text>
          <Text style={styles.description}>{area.description}</Text>
        </Card>
      ))}
      <Button
        label="Sign out"
        onPress={() => setIsLogoutVisible(true)}
        variant="danger"
      />
      <LogoutConfirmation
        isLoggingOut={isLoggingOut}
        onCancel={() => setIsLogoutVisible(false)}
        onConfirm={() => void logout()}
        visible={isLogoutVisible}
      />
    </ScrollView>
  );
}

function AdminFormShell({
  area,
  onBack,
  onOrganizationCreated,
}: {
  area: ManagementArea;
  onBack: () => void;
  onOrganizationCreated?: (organization: AdminOrganization) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Button fullWidth={false} label="Back to management" onPress={onBack} variant="ghost" />
      {area === 'organization' ? <OrganizationForm onCreated={onOrganizationCreated} /> : null}
      {area === 'class' ? <ClassForm /> : null}
      {area === 'participants' ? <ParticipantForm /> : null}
      {area === 'reminders' ? <ReminderForm /> : null}
    </ScrollView>
  );
}

function OrganizationForm({
  onCreated,
}: {
  onCreated?: (organization: AdminOrganization) => void;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrganization = async () => {
    if (!name.trim()) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const organization = await adminApi.createOrganization({
        code: code.trim() || null,
        description: description.trim() || null,
        logo_path: logoPath.trim() || null,
        name: name.trim(),
        status,
      });
      Alert.alert('Organization created', 'The organization has been created successfully.', [
        { text: 'Done', onPress: () => onCreated?.(organization) },
      ]);
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Add Organization</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TextInput
        label="Organization Name *"
        onChangeText={setName}
        placeholder="e.g. Al-Huda Education Centre"
        value={name}
      />
      <TextInput
        autoCapitalize="characters"
        label="Code"
        onChangeText={setCode}
        placeholder="e.g. ALHUDA"
        value={code}
      />
      <TextInput
        label="Description"
        multiline
        onChangeText={setDescription}
        placeholder="Brief description about the organization"
        value={description}
      />
      <TextInput
        autoCapitalize="none"
        label="Logo Path (Optional)"
        onChangeText={setLogoPath}
        placeholder="organizations/alhuda/logo.png"
        value={logoPath}
      />
      <View style={styles.logoSection}>
        <Text style={styles.fieldLabel}>Logo (Optional)</Text>
        <Pressable
          accessibilityLabel="Upload organization logo"
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              'Logo upload',
              'Logo upload will be available when media support is connected.',
            )
          }
          style={styles.logoDropzone}
        >
          <Ionicons color={colors.mutedText} name="image-outline" size={25} />
          <Text style={styles.logoHint}>Tap to upload logo</Text>
        </Pressable>
      </View>
      <View style={styles.statusSection}>
        <Text style={styles.fieldLabel}>Status</Text>
        <View style={styles.statusOptions}>
          {statusOptions.map((option) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: status === option.value }}
              key={option.value}
              onPress={() => setStatus(option.value)}
              style={styles.statusOption}
            >
              <View style={[styles.radio, status === option.value && styles.radioSelected]}>
                {status === option.value ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={styles.statusLabel}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Button
        disabled={!name.trim() || isSubmitting}
        label="Create Organization"
        loading={isSubmitting}
        onPress={() => void createOrganization()}
        variant="brand"
      />
    </View>
  );
}

function ClassForm() {
  return (
    <View style={styles.form}>
      <Text style={styles.title}>Create class</Text>
      <TextInput
        editable={false}
        label="Organization"
        placeholder="Select an authorized organization"
      />
      <TextInput editable={false} label="Class name" placeholder="Class API required" />
      <TextInput editable={false} label="Teacher name" placeholder="Teacher API required" />
      <Select
        enabled={false}
        label="Day"
        onValueChange={() => undefined}
        options={dayOptions}
        value="monday"
      />
      <Select
        enabled={false}
        label="Time"
        onValueChange={() => undefined}
        options={timeOptions}
        value="10:00"
      />
      <Select
        enabled={false}
        label="Frequency"
        onValueChange={() => undefined}
        options={frequencyOptions}
        value="weekly"
      />
      <TextInput
        editable={false}
        label="Payment amount"
        keyboardType="decimal-pad"
        placeholder="Backend amount rule required"
      />
      <Select
        enabled={false}
        label="Participants"
        onValueChange={() => undefined}
        options={participantOptions}
        value="students"
      />
      <TextInput
        editable={false}
        label="Bank account number"
        keyboardType="numeric"
        placeholder="Payment setup API required"
      />
      <TextInput editable={false} label="Bank name" placeholder="Payment setup API required" />
      <TextInput
        editable={false}
        label="QR payment information"
        placeholder="Payment setup API required"
      />
      <PendingAction label="Create class" />
    </View>
  );
}

function ParticipantForm() {
  return (
    <View style={styles.form}>
      <Text style={styles.title}>Add participants</Text>
      <Select
        enabled={false}
        label="Participant type"
        onValueChange={() => undefined}
        options={participantOptions}
        value="students"
      />
      <TextInput editable={false} label="Class" placeholder="Select an authorized class" />
      <TextInput editable={false} label="Full name" placeholder="Participant API required" />
      <TextInput
        editable={false}
        label="Phone number"
        keyboardType="phone-pad"
        placeholder="+60123456789"
      />
      <PendingAction label="Add participant" />
    </View>
  );
}

function ReminderForm() {
  return (
    <View style={styles.form}>
      <Text style={styles.title}>Send payment reminder</Text>
      <Text style={styles.description}>
        Email and Telegram delivery require a documented backend reminder contract.
      </Text>
      <TextInput editable={false} label="Class" placeholder="Select an authorized class" />
      <Select
        enabled={false}
        label="Delivery channel"
        onValueChange={() => undefined}
        options={channelOptions}
        value="email"
      />
      <PendingAction label="Send reminder" />
    </View>
  );
}

function PendingAction({ label }: { label: string }) {
  return (
    <Button
      accessibilityHint="This action requires a documented backend API contract"
      disabled
      label={label}
      onPress={() => undefined}
    />
  );
}

const managementAreas: readonly { id: ManagementArea; title: string; description: string }[] = [
  {
    id: 'organization',
    title: 'Organization setup',
    description: 'Organization name, description, and status.',
  },
  {
    id: 'class',
    title: 'Class management',
    description: 'Class, teacher, schedule, frequency, and payment setup.',
  },
  {
    id: 'participants',
    title: 'Participant management',
    description: 'Students and sponsors assigned to an authorized class.',
  },
  {
    id: 'reminders',
    title: 'Payment reminders',
    description: 'Email and Telegram reminder delivery.',
  },
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
] as const;
const dayOptions = [{ label: 'Monday', value: 'monday' }] as const;
const timeOptions = [{ label: '10:00 AM', value: '10:00' }] as const;
const frequencyOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Fortnightly', value: 'fortnightly' },
  { label: 'Monthly', value: 'monthly' },
] as const;
const participantOptions = [
  { label: 'Students', value: 'students' },
  { label: 'Sponsors', value: 'sponsors' },
] as const;
const channelOptions = [
  { label: 'Email', value: 'email' },
  { label: 'Telegram', value: 'telegram' },
] as const;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  title: { ...typography.heading, color: colors.text },
  formTitle: { ...typography.heading, color: colors.text, fontSize: 22 },
  fieldLabel: { ...typography.label, color: colors.text },
  label: { ...typography.label, color: colors.text },
  description: { ...typography.bodySmall, color: colors.mutedText, marginTop: spacing.xxs },
  form: { gap: spacing.md },
  logoSection: { gap: spacing.xs },
  logoDropzone: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 80,
    justifyContent: 'center',
  },
  logoHint: { ...typography.caption, color: colors.mutedText },
  statusSection: { gap: spacing.sm },
  statusOptions: { flexDirection: 'row', gap: spacing.xl },
  statusOption: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  radio: {
    alignItems: 'center',
    borderColor: colors.mutedText,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  radioSelected: { borderColor: colors.info },
  radioDot: { backgroundColor: colors.info, borderRadius: radius.pill, height: 10, width: 10 },
  statusLabel: { ...typography.bodySmall, color: colors.text },
  error: { ...typography.bodySmall, color: colors.danger },
});
