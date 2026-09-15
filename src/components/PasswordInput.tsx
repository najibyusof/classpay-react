import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput as NativeTextInput, View } from 'react-native';

import type { TextInputProps } from './TextInput';
import { colors, radius, spacing, typography } from '../theme';

export type PasswordInputProps = Omit<TextInputProps, 'secureTextEntry'>;

export function PasswordInput({
  label,
  error,
  hint,
  accessibilityLabel,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const helperText = error ?? hint;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <NativeTextInput
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled: props.editable === false }}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={!isVisible}
          style={styles.input}
          {...props}
        />
        <Pressable
          accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
          accessibilityRole="button"
          hitSlop={spacing.xs}
          onPress={() => setIsVisible((visible) => !visible)}
          style={styles.visibilityButton}
        >
          <Ionicons
            color={colors.mutedText}
            name={isVisible ? 'eye-off-outline' : 'eye-outline'}
            size={22}
          />
        </Pressable>
      </View>
      {helperText ? <Text style={[styles.helper, error && styles.error]}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  inputError: { borderColor: colors.danger },
  input: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    minHeight: 46,
    paddingHorizontal: spacing.sm,
  },
  visibilityButton: { alignItems: 'center', justifyContent: 'center', minHeight: 46, minWidth: 46 },
  helper: { ...typography.caption, color: colors.mutedText },
  error: { color: colors.danger },
});
