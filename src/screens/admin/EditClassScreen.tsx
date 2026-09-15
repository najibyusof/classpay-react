import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { adminApi } from '../../api/adminApi';
import { AppHeader, Button, ErrorState, Select, TextInput } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import type { AdminClass } from '../../types/admin';

export const editClassSchema = z.object({
  name: z.string().trim().min(1, 'Enter a class name').max(150, 'Class name is too long'),
  description: z.string().trim().max(1000, 'Description is too long'),
  teacherName: z.string().trim().max(150, 'Teacher name is too long'),
  status: z.enum(['draft', 'active', 'inactive', 'completed']),
  dayOfWeek: z.string().optional(),
  startTime: z.string().trim().optional(),
  recurrenceType: z.enum(['weekly', 'fortnightly', 'monthly']).optional(),
  paymentAmount: z
    .string()
    .trim()
    .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: 'Enter a valid payment amount',
    }),
});

type EditClassFormValues = z.infer<typeof editClassSchema>;

const dayOptions = [
  { label: 'Sunday', value: '0' },
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
] as const;

const timeOptions = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '20:00',
  '21:00',
].map((value) => ({ label: to12Hour(value), value }));

const frequencyOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Fortnightly', value: 'fortnightly' },
  { label: 'Monthly', value: 'monthly' },
] as const;

function to12Hour(value: string) {
  const [hour = 0, minute = 0] = value.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

function to24Hour(value?: string | null) {
  if (!value) return undefined;
  const [hour = 0, minute = 0] = value.split(':').map(Number);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function EditClassScreen({
  classItem,
  onBack,
  onSaved,
  organizationId,
  organizationName,
}: {
  classItem: AdminClass;
  onBack: () => void;
  onSaved: (classItem: AdminClass) => void;
  organizationId: number | string;
  organizationName: string;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditClassFormValues>({
    defaultValues: {
      dayOfWeek:
        classItem.schedules?.[0]?.day_of_week !== undefined
          ? String(classItem.schedules[0].day_of_week)
          : classItem.day_of_week !== undefined
            ? String(classItem.day_of_week)
            : undefined,
      description: classItem.description ?? '',
      name: classItem.name,
      paymentAmount:
        classItem.payment_setting?.required_amount !== null &&
        classItem.payment_setting?.required_amount !== undefined
          ? String(classItem.payment_setting.required_amount)
          : classItem.payment_amount !== null && classItem.payment_amount !== undefined
            ? String(classItem.payment_amount)
            : '',
      recurrenceType: normalizeRecurrence(
        classItem.schedules?.[0]?.recurrence_type ?? classItem.frequency,
      ),
      startTime: to24Hour(classItem.schedules?.[0]?.start_time ?? classItem.start_time),
      status: normalizeStatus(classItem.status),
      teacherName: classItem.teacher_name ?? '',
    },
    resolver: zodResolver(editClassSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const updatedClass = await adminApi.updateOrganizationClass(organizationId, classItem.id, {
        day_of_week: values.dayOfWeek === undefined ? undefined : Number(values.dayOfWeek),
        description: values.description || null,
        name: values.name.trim(),
        payment_amount: values.paymentAmount ? Number(values.paymentAmount) : undefined,
        recurrence_type: values.recurrenceType,
        start_time: values.startTime || undefined,
        status: values.status,
        teacher_name: values.teacherName.trim(),
      });
      Alert.alert('Class updated', 'The class details have been saved.', [
        { text: 'Done', onPress: () => onSaved(updatedClass) },
      ]);
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <View style={styles.flex}>
      <AppHeader onBackPress={onBack} title="Edit Class" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Update class details</Text>
        <Text style={styles.organization}>Organization: {organizationName}</Text>
        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                error={errors.name?.message}
                label="Class Name *"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Class name"
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
                placeholder="Class description"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="teacherName"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                error={errors.teacherName?.message}
                label="Teacher Name"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Teacher name"
                value={value}
              />
            )}
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
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Controller
                control={control}
                name="dayOfWeek"
                render={({ field: { onChange, value } }) => (
                  <Select
                    error={errors.dayOfWeek?.message}
                    label="Day"
                    onValueChange={onChange}
                    options={dayOptions}
                    value={value ?? '1'}
                  />
                )}
              />
            </View>
            <View style={styles.dateField}>
              <Controller
                control={control}
                name="startTime"
                render={({ field: { onChange, value } }) => (
                  <Select
                    error={errors.startTime?.message}
                    label="Time"
                    onValueChange={onChange}
                    options={timeOptions}
                    value={value ?? '10:00'}
                  />
                )}
              />
            </View>
          </View>
          <Controller
            control={control}
            name="recurrenceType"
            render={({ field: { onChange, value } }) => (
              <Select
                error={errors.recurrenceType?.message}
                label="Frequency"
                onValueChange={onChange}
                options={frequencyOptions}
                value={value ?? 'weekly'}
              />
            )}
          />
          <Controller
            control={control}
            name="paymentAmount"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                error={errors.paymentAmount?.message}
                keyboardType="decimal-pad"
                label="Payment Amount (RM)"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="50.00"
                value={value}
              />
            )}
          />
        </View>
        <Button
          disabled={isSubmitting}
          label="Save Changes"
          loading={isSubmitting}
          onPress={onSubmit}
          testID="edit-class-submit"
          variant="brand"
        />
      </ScrollView>
    </View>
  );
}

function normalizeStatus(status?: string | null): EditClassFormValues['status'] {
  return status === 'active' || status === 'inactive' || status === 'completed' ? status : 'draft';
}

function normalizeRecurrence(
  value?: string | null,
): EditClassFormValues['recurrenceType'] {
  return value === 'fortnightly' || value === 'monthly' ? value : value === 'weekly' ? 'weekly' : undefined;
}

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Completed', value: 'completed' },
] as const;

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.lg, padding: spacing.lg },
  title: { ...typography.heading, color: colors.text, fontSize: 22 },
  organization: { ...typography.bodySmall, color: colors.mutedText },
  form: { gap: spacing.md },
  statusSection: { gap: spacing.sm },
  fieldLabel: { ...typography.label, color: colors.text },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
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
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateField: { flex: 1 },
});
