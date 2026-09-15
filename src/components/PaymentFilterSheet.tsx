import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import type { PaymentHistoryFilters } from '../types/student';
import { colors, radius, spacing, typography } from '../theme';
import { Button } from './Button';
import { DatePickerInput } from './DatePickerInput';
import { Select } from './Select';
import { TextInput } from './TextInput';

interface PaymentFilterSheetProps {
  visible: boolean;
  filters: PaymentHistoryFilters;
  onApply: (filters: PaymentHistoryFilters) => void;
  onClose: () => void;
}

export function PaymentFilterSheet({
  visible,
  filters,
  onApply,
  onClose,
}: PaymentFilterSheetProps) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [filters, visible]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.sheet}>
          <Text style={styles.title}>Filter payments</Text>
          <Select
            label="Status"
            onValueChange={(status) =>
              setDraft({ ...draft, status: status === 'all' ? undefined : status })
            }
            options={statusOptions}
            value={draft.status ?? 'all'}
          />
          <Select
            label="Payment method"
            onValueChange={(payment_method) =>
              setDraft({
                ...draft,
                payment_method: payment_method === 'all' ? undefined : payment_method,
              })
            }
            options={methodOptions}
            value={draft.payment_method ?? 'all'}
          />
          <TextInput
            label="Class ID"
            keyboardType="numeric"
            onChangeText={(classId) => setDraft({ ...draft, class_id: classId || undefined })}
            value={draft.class_id ? String(draft.class_id) : ''}
          />
          <DatePickerInput
            label="From date"
            onChange={(date_from) => setDraft({ ...draft, date_from })}
            value={draft.date_from}
          />
          <DatePickerInput
            label="To date"
            minimumDate={parseDate(draft.date_from)}
            onChange={(date_to) => setDraft({ ...draft, date_to })}
            value={draft.date_to}
          />
          <Select
            label="Items per page"
            onValueChange={(perPage) => setDraft({ ...draft, per_page: Number(perPage) })}
            options={perPageOptions}
            value={String(draft.per_page ?? 20) as '10' | '20' | '50'}
          />
          <View style={styles.actions}>
            <Button
              label="Clear"
              onPress={() => setDraft({ per_page: draft.per_page ?? 20 })}
              variant="ghost"
            />
            <Button
              label="Done"
              onPress={() => {
                onApply(draft);
                onClose();
              }}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Initiated', value: 'initiated' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
] as const;
const methodOptions = [
  { label: 'All methods', value: 'all' },
  { label: 'Merchant', value: 'merchant' },
  { label: 'QR', value: 'qr' },
  { label: 'Bank transfer', value: 'bank_transfer' },
  { label: 'Manual', value: 'manual' },
] as const;
const perPageOptions = [
  { label: '10 per page', value: '10' },
  { label: '20 per page', value: '20' },
  { label: '50 per page', value: '50' },
] as const;

function parseDate(value?: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: colors.overlay, flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: { ...typography.heading, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
});
