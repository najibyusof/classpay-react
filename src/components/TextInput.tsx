import type { ComponentProps } from 'react';
import { StyleSheet, Text, TextInput as NativeTextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type NativeTextInputProps = ComponentProps<typeof NativeTextInput>;

export interface TextInputProps extends Omit<NativeTextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  containerTestID?: string;
}

export function TextInput({
  label,
  error,
  hint,
  containerTestID,
  accessibilityLabel,
  ...props
}: TextInputProps) {
  const helperText = error ?? hint;

  return (
    <View style={styles.container} testID={containerTestID}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <NativeTextInput
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: props.editable === false }}
        placeholderTextColor={colors.inputPlaceholder}
        style={[styles.input, error && styles.inputError]}
        {...props}
      />
      {helperText ? <Text style={[styles.helper, error && styles.error]}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
  },
  inputError: { borderColor: colors.danger },
  helper: { ...typography.caption, color: colors.mutedText },
  error: { color: colors.danger },
});
