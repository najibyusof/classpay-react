import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

export interface SelectOption<Value extends string> {
  label: string;
  value: Value;
}

interface SelectProps<Value extends string> {
  label: string;
  value: Value;
  options: readonly SelectOption<Value>[];
  onValueChange: (value: Value) => void;
  error?: string;
  hint?: string;
  enabled?: boolean;
}

export function Select<Value extends string>({
  label,
  value,
  options,
  onValueChange,
  error,
  hint,
  enabled = true,
}: SelectProps<Value>) {
  const helperText = error ?? hint;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pickerContainer, error && styles.pickerError]}>
        <Picker
          accessibilityLabel={label}
          enabled={enabled}
          onValueChange={(selectedValue) => onValueChange(selectedValue as Value)}
          selectedValue={value}
          style={styles.picker}
        >
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
      {helperText ? <Text style={[styles.helper, error && styles.error]}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerError: { borderColor: colors.danger },
  picker: { color: colors.text, minHeight: 48 },
  helper: { ...typography.caption, color: colors.mutedText },
  error: { color: colors.danger },
});
