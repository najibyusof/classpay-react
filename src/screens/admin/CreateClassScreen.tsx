import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { adminApi } from '../../api/adminApi';
import { AppHeader, Button, ClassQrCodePicker, ErrorState, Select, TextInput } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import type { AdminClass, ClassQrCodeAsset, CreateClassRequest } from '../../types/admin';
import { confirmAction } from '../../utils/confirmAction';
import {
  classHourOptions,
  classMinuteOptions,
  classPeriodOptions,
  toApiClassTime,
} from '../../utils/classTime';

export const createClassSchema = z.object({
  name: z.string().trim().min(1, 'Enter a class name').max(150, 'Class name is too long'),
  teacherName: z
    .string()
    .trim()
    .min(1, 'Enter the teacher name')
    .max(150, 'Teacher name is too long'),
  dayOfWeek: z.string().min(1, 'Select a day'),
  startHour: z.string().min(1, 'Select an hour'),
  startMinute: z.string().min(1, 'Select minutes'),
  startPeriod: z.enum(['AM', 'PM']),
  recurrenceType: z.enum(['weekly', 'fortnightly', 'monthly']),
  paymentAmount: z
    .string()
    .trim()
    .min(1, 'Enter the payment amount')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: 'Enter a valid payment amount',
    }),
  description: z.string().trim().max(1000, 'Description is too long'),
  bankName: z.string().trim().max(100, 'Bank name is too long'),
  bankAccountName: z.string().trim().max(150, 'Account name is too long'),
  bankAccountNumber: z.string().trim().max(100, 'Account number is too long'),
});

type CreateClassFormValues = z.infer<typeof createClassSchema>;

const dayOptions = [
  { label: 'Sunday', value: '0' },
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
] as const;

const frequencyOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Fortnightly', value: 'fortnightly' },
  { label: 'Monthly', value: 'monthly' },
] as const;

export function CreateClassScreen({
  onBack,
  onCreated,
  organizationId,
  organizationName,
}: {
  onBack: () => void;
  onCreated: (classItem: AdminClass) => void;
  organizationId: number | string;
  organizationName: string;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeAsset, setQrCodeAsset] = useState<ClassQrCodeAsset | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClassFormValues>({
    defaultValues: {
      bankAccountName: '',
      bankAccountNumber: '',
      bankName: '',
      dayOfWeek: '1',
      description: '',
      name: '',
      paymentAmount: '',
      recurrenceType: 'weekly',
      startHour: '10',
      startMinute: '00',
      startPeriod: 'AM',
      teacherName: '',
    },
    resolver: zodResolver(createClassSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const payload: CreateClassRequest = {
        day_of_week: Number(values.dayOfWeek),
        description: values.description || null,
        name: values.name.trim(),
        payment_amount: Number(values.paymentAmount),
        recurrence_type: values.recurrenceType,
        start_time: toApiClassTime(values.startHour, values.startMinute, values.startPeriod),
        teacher_name: values.teacherName.trim(),
      };
      const createdClass = await adminApi.createOrganizationClass(organizationId, payload);
      if (values.bankName || values.bankAccountName || values.bankAccountNumber) {
        await adminApi.updateClassPaymentSetting(createdClass.id, {
          bank_account_name: values.bankAccountName || null,
          bank_account_number: values.bankAccountNumber || null,
          bank_name: values.bankName || null,
        });
      }
      if (qrCodeAsset) {
        await adminApi.uploadClassPaymentQrCode(createdClass.id, qrCodeAsset);
      }
      Alert.alert('Class created', 'The class has been added to this organization.', [
        { text: 'Done', onPress: () => onCreated(createdClass) },
      ]);
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <View style={styles.flex}>
      <AppHeader onBackPress={onBack} title="Create Class" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Organization</Text>
        <View style={styles.organizationCard}>
          <Text style={styles.organizationName}>{organizationName}</Text>
        </View>
        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        <Text style={styles.sectionLabel}>Class Information</Text>
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
                placeholder="e.g. Quran Class"
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
                label="Teacher Name *"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. Cikgu Ahmad"
                value={value}
              />
            )}
          />
          <View style={styles.rowFields}>
            <View style={styles.fieldHalf}>
              <Controller
                control={control}
                name="dayOfWeek"
                render={({ field: { onChange, value } }) => (
                  <Select
                    error={errors.dayOfWeek?.message}
                    label="Day *"
                    onValueChange={onChange}
                    options={dayOptions}
                    value={value}
                  />
                )}
              />
            </View>
          </View>
          <View style={styles.rowFields}>
            <View style={styles.fieldThird}>
              <Controller
                control={control}
                name="startHour"
                render={({ field: { onChange, value } }) => (
                  <Select
                    error={errors.startHour?.message}
                    label="Hour *"
                    onValueChange={onChange}
                    options={classHourOptions}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={styles.fieldThird}>
              <Controller
                control={control}
                name="startMinute"
                render={({ field: { onChange, value } }) => (
                  <Select
                    error={errors.startMinute?.message}
                    label="Minutes *"
                    onValueChange={onChange}
                    options={classMinuteOptions}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={styles.fieldThird}>
              <Controller
                control={control}
                name="startPeriod"
                render={({ field: { onChange, value } }) => (
                  <Select
                    error={errors.startPeriod?.message}
                    label="AM/PM *"
                    onValueChange={onChange}
                    options={classPeriodOptions}
                    value={value}
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
                label="Frequency *"
                onValueChange={onChange}
                options={frequencyOptions}
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
                placeholder="Weekly class"
                value={value}
              />
            )}
          />
        </View>
        <Text style={styles.sectionLabel}>Payment Information</Text>
        <View style={styles.form}>
          <Controller
            control={control}
            name="paymentAmount"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                error={errors.paymentAmount?.message}
                keyboardType="decimal-pad"
                label="Payment Amount (RM) *"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="50.00"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="bankName"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                error={errors.bankName?.message}
                label="Bank Name"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. Maybank"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="bankAccountName"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                error={errors.bankAccountName?.message}
                label="Account Name"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. Pusat Tuisyen ClassPay"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="bankAccountNumber"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                error={errors.bankAccountNumber?.message}
                keyboardType="number-pad"
                label="Account Number"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="551234567890"
                value={value}
              />
            )}
          />
          <ClassQrCodePicker onChange={setQrCodeAsset} value={qrCodeAsset} />
        </View>
        <Button
          disabled={isSubmitting}
          label="Create Class"
          loading={isSubmitting}
          onPress={() =>
            confirmAction({
              confirmLabel: 'Create',
              message: 'Create this class?',
              onConfirm: onSubmit,
              title: 'Confirm create',
            })
          }
          testID="create-class-submit"
          variant="brand"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.lg, padding: spacing.lg },
  sectionLabel: { ...typography.label, color: colors.text, fontWeight: '600' },
  organizationCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
  },
  organizationName: { ...typography.body, color: colors.text },
  form: { gap: spacing.md },
  rowFields: { flexDirection: 'row', gap: spacing.sm },
  fieldHalf: { flex: 1 },
  fieldThird: { flex: 1 },
});
