import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { ClassQrCodeAsset } from '../types/admin';

export function ClassQrCodePicker({
  existingUri,
  value,
  onChange,
}: {
  existingUri?: string | null;
  value?: ClassQrCodeAsset | null;
  onChange: (asset: ClassQrCodeAsset | null) => void;
}) {
  const chooseQrCode = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    onChange({
      name: asset.fileName ?? `class-payment-qr-${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
      uri: asset.uri,
    });
  };

  const previewUri = value?.uri ?? existingUri;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Payment QR Code (Optional)</Text>
      <Pressable
        accessibilityLabel="Upload class payment QR code"
        accessibilityRole="button"
        onPress={() => void chooseQrCode()}
        style={styles.dropzone}
      >
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.preview} />
        ) : (
          <Text style={styles.hint}>Tap to upload QR code</Text>
        )}
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => void chooseQrCode()}>
        <Text style={styles.actionText}>{previewUri ? 'Upload new QR code' : 'Choose QR code'}</Text>
      </Pressable>
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
    minHeight: 120,
    overflow: 'hidden',
  },
  preview: { height: 108, width: 108 },
  hint: { ...typography.caption, color: colors.mutedText },
  actionText: { ...typography.label, color: colors.info },
  fileName: { ...typography.caption, color: colors.mutedText },
});
