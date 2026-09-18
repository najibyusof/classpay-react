import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { adminApi } from '../../api/adminApi';
import { AppHeader, Button, ErrorState, OrganizationLogoPicker, TextInput } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import type { AdminOrganization } from '../../types/admin';
import type { OrganizationLogoAsset } from '../../types/admin';
import { confirmAction } from '../../utils/confirmAction';

export const editOrganizationSchema = z.object({
  name: z.string().trim().min(1, 'Enter an organization name').max(200, 'Name is too long'),
  code: z.string().trim().max(50, 'Code is too long'),
  description: z.string().trim().max(1000, 'Description is too long'),
  status: z.enum(['active', 'inactive']),
});

type EditOrganizationFormValues = z.infer<typeof editOrganizationSchema>;

export function EditOrganizationScreen({
  onBack,
  onSaved,
  organization,
}: {
  onBack: () => void;
  onSaved: (organization: AdminOrganization) => void;
  organization: AdminOrganization;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoAsset, setLogoAsset] = useState<OrganizationLogoAsset | null>(null);
  const [isLogoRemoved, setIsLogoRemoved] = useState(false);
  const queryClient = useQueryClient();
  const logoQueryKey = ['admin', 'organizations', organization.id, 'logo'] as const;
  const logoQuery = useQuery({
    queryKey: logoQueryKey,
    queryFn: () => adminApi.getOrganizationLogoUrl(organization.id),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditOrganizationFormValues>({
    defaultValues: {
      code: organization.code ?? '',
      description: organization.description ?? '',
      name: organization.name,
      status: organization.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active',
    },
    resolver: zodResolver(editOrganizationSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      let updatedOrganization = await adminApi.updateOrganization(organization.id, {
        code: values.code || null,
        description: values.description || null,
        ...(isLogoRemoved && !logoAsset ? { logo_path: null } : {}),
        name: values.name.trim(),
        status: values.status,
      });
      if (logoAsset) {
        updatedOrganization = await adminApi.uploadOrganizationLogo(organization.id, logoAsset);
      }
      await queryClient.invalidateQueries({ queryKey: logoQueryKey });
      Alert.alert('Organization updated', 'The organization details have been saved.', [
        { text: 'Done', onPress: () => onSaved(updatedOrganization) },
      ]);
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <View style={styles.flex}>
      <AppHeader onBackPress={onBack} title="Edit Organization" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Update Organization Details</Text>
        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                error={errors.name?.message}
                label="Organization Name *"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Organization name"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="code"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                autoCapitalize="characters"
                error={errors.code?.message}
                label="Code"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. ALHUDA"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                error={errors.description?.message}
                label="Description"
                multiline
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Brief description about the organization"
                value={value}
              />
            )}
          />
          <OrganizationLogoPicker
            existingUri={isLogoRemoved ? null : logoQuery.data}
            onChange={(asset) => {
              setLogoAsset(asset);
              if (asset) setIsLogoRemoved(false);
            }}
            onRemove={() => setIsLogoRemoved(true)}
            value={logoAsset}
          />
          <View style={styles.statusSection}>
            <Text style={styles.fieldLabel}>Status</Text>
            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, value } }) => (
                <View style={styles.statusOptions}>
                  {statusOptions.map((option) => (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: value === option.value }}
                      key={option.value}
                      onPress={() => onChange(option.value)}
                      style={styles.statusOption}
                    >
                      <View style={[styles.radio, value === option.value && styles.radioSelected]}>
                        {value === option.value ? <View style={styles.radioDot} /> : null}
                      </View>
                      <Text style={styles.statusLabel}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          </View>
        </View>
        <Button
          disabled={isSubmitting}
          label="Save Changes"
          loading={isSubmitting}
          onPress={() =>
            confirmAction({
              confirmLabel: 'Save',
              message: 'Save changes to this organization?',
              onConfirm: onSubmit,
              title: 'Confirm update',
            })
          }
          testID="edit-organization-submit"
          variant="brand"
        />
      </ScrollView>
    </View>
  );
}

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
] as const;

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.lg, padding: spacing.lg },
  title: { ...typography.heading, color: colors.text, fontSize: 22 },
  form: { gap: spacing.md },
  statusSection: { gap: spacing.sm },
  fieldLabel: { ...typography.label, color: colors.text },
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
});
