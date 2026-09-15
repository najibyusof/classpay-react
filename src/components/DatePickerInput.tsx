import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography } from '../theme';

interface DatePickerInputProps {
  label: string;
  value?: string;
  error?: string;
  minimumDate?: Date;
  onChange: (value: string) => void;
}

export function DatePickerInput({
  error,
  label,
  minimumDate,
  onChange,
  value = '',
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={[styles.input, error && styles.inputError]}
      >
        <Text style={value ? styles.value : styles.placeholder}>{value || 'Select date'}</Text>
        <Ionicons color={colors.info} name="calendar-outline" size={19} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isOpen ? (
        <DateTimePicker
          display="default"
          minimumDate={minimumDate}
          mode="date"
          onDismiss={() => setIsOpen(false)}
          onNeutralButtonPress={() => setIsOpen(false)}
          onValueChange={(_, date) => {
            onChange(formatDate(date));
            setIsOpen(false);
          }}
          value={parseDate(value) ?? minimumDate ?? new Date()}
        />
      ) : null}
    </View>
  );
}

function parseDate(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  input: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.sm,
  },
  inputError: { borderColor: colors.danger },
  value: { ...typography.body, color: colors.text },
  placeholder: { ...typography.body, color: colors.inputPlaceholder },
  error: { ...typography.caption, color: colors.danger },
});
