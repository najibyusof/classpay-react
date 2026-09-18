import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { OrganizationLogoAsset } from '../types/admin';

export function OrganizationLogoPicker({
  existingUri,
  value,
  onChange,
  onRemove,
}: {
  existingUri?: string | null;
  value?: OrganizationLogoAsset | null;
  onChange: (asset: OrganizationLogoAsset | null) => void;
  onRemove?: () => void;
}) {
  const chooseLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    onChange({
      name: asset.fileName ?? `organization-logo-${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
      uri: asset.uri,
    });
  };

  const previewUri = value?.uri ?? existingUri;
  const hasLogo = Boolean(previewUri);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Logo (Pilihan)</Text>
      <Pressable
        accessibilityLabel="Muat naik logo organisasi"
        accessibilityRole="button"
        onPress={() => void chooseLogo()}
        style={styles.dropzone}
      >
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.preview} />
        ) : (
          <Text style={styles.hint}>Tekan untuk memilih logo</Text>
        )}
      </Pressable>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={() => void chooseLogo()}>
          <Text style={styles.actionText}>{hasLogo ? 'Muat naik logo baharu' : 'Pilih logo'}</Text>
        </Pressable>
        {hasLogo ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onChange(null);
              onRemove?.();
            }}
          >
            <Text style={styles.removeText}>Buang logo</Text>
          </Pressable>
        ) : null}
      </View>
      {value ? <Text style={styles.fileName}>{value.name}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  dropzone: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 96,
    overflow: 'hidden',
  },
  preview: { height: 88, width: 88 },
  hint: { ...typography.caption, color: colors.mutedText },
  actions: { flexDirection: 'row', gap: spacing.md },
  actionText: { ...typography.label, color: colors.info },
  removeText: { ...typography.label, color: colors.danger },
  fileName: { ...typography.caption, color: colors.mutedText },
});
