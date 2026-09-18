import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';

import { adminApi } from '../../api/adminApi';
import { Button, ErrorState, Skeleton, StatusBadge } from '../../components';
import { environment } from '../../constants/environment';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import type { AdminClass } from '../../types/admin';

export function OrganizationClassDetailScreen({
  classId,
  onBack,
  onAddParticipants,
  onEdit,
  onViewPayments,
  organizationId,
  organizationName,
}: {
  classId: number | string;
  onBack: () => void;
  onAddParticipants: () => void;
  onEdit: () => void;
  onViewPayments: () => void;
  organizationId: number | string;
  organizationName: string;
}) {
  const [qrCodeUnavailable, setQrCodeUnavailable] = useState(false);
  const [qrViewerVisible, setQrViewerVisible] = useState(false);
  const classQuery = useQuery({
    queryKey: ['admin', 'organizations', organizationId, 'classes', classId],
    queryFn: () => adminApi.getOrganizationClass(organizationId, classId),
  });
  const paymentSettingQuery = useQuery({
    queryKey: ['admin', 'classes', classId, 'payment-setting'],
    queryFn: () => adminApi.getClassPaymentSetting(classId),
  });
  const participantsQuery = useQuery({
    queryKey: ['admin', 'classes', classId, 'participants'],
    queryFn: () => adminApi.getClassParticipants(classId),
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const refreshClass = async () => {
    const result = await classQuery.refetch();
    if (result.error) {
      Alert.alert('Refresh failed', normalizeApiError(result.error).message);
      return;
    }
    Alert.alert('Class details refreshed', 'The latest class details were loaded from the server.');
  };

  if (classQuery.isLoading) return <Skeleton height={480} />;
  if (classQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(classQuery.error).message}
        onRetry={() => void classQuery.refetch()}
      />
    );
  if (!classQuery.data) return <Skeleton height={480} />;
  const classItem = classQuery.data;
  const qrCodeUri = `${environment.apiBaseUrl}/classes/${classId}/payment-setting/qr-code-file`;
  const participantsTotal = (participantsQuery.data?.meta as { total?: unknown } | undefined)
    ?.total;
  const participantsListCount = participantsQuery.data?.data.length;
  const participantsCount =
    typeof participantsTotal === 'number' ? participantsTotal : participantsListCount;
  const participantsError = participantsQuery.isError
    ? normalizeApiError(participantsQuery.error).message
    : null;

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to classes"
          accessibilityRole="button"
          hitSlop={spacing.sm}
          onPress={onBack}
          style={styles.headerButton}
        >
          <Ionicons color={colors.text} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Class Details</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Edit class"
            accessibilityRole="button"
            onPress={onEdit}
            style={styles.headerButton}
          >
            <Ionicons color={colors.info} name="create-outline" size={21} />
          </Pressable>
          <Pressable
            accessibilityLabel="Refresh class details"
            accessibilityRole="button"
            disabled={classQuery.isFetching}
            onPress={() => void refreshClass()}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          >
            <Ionicons
              color={classQuery.isFetching ? colors.mutedText : colors.info}
              name="refresh-outline"
              size={21}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="Class options"
            accessibilityRole="button"
            onPress={() =>
              Alert.alert('Class options', 'Class management actions are not available yet.')
            }
            style={styles.headerButton}
          >
            <Ionicons color={colors.text} name="ellipsis-vertical" size={21} />
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <ClassSummary
          classItem={classItem}
          organizationName={organizationName}
          paymentSetting={paymentSettingQuery.data ?? classItem.payment_setting}
          participantsCount={participantsCount}
        />
        {participantsError ? (
          <ErrorState
            message={`Could not load participants: ${participantsError}`}
            onRetry={() => void participantsQuery.refetch()}
          />
        ) : null}
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>Payment QR Code</Text>
          {!qrCodeUnavailable ? (
            <Image
              accessibilityLabel="Class payment QR code"
              onError={() => setQrCodeUnavailable(true)}
              resizeMode="contain"
              source={{ uri: qrCodeUri }}
              style={styles.qrImage}
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Ionicons color={colors.mutedText} name="qr-code-outline" size={58} />
              <Text style={styles.qrHint}>No QR code available</Text>
            </View>
          )}
          <View style={styles.qrActions}>
            <Button
              disabled={qrCodeUnavailable}
              fullWidth={false}
              icon="scan-outline"
              label="View Full Size"
              onPress={() => setQrViewerVisible(true)}
              variant="outline"
            />
            <Button
              disabled={qrCodeUnavailable}
              fullWidth={false}
              icon="share-outline"
              label="Share"
              onPress={() =>
                void Share.share({
                  message: `Payment QR Code: ${qrCodeUri}`,
                  title: 'Payment QR Code',
                  url: qrCodeUri,
                })
              }
              variant="outline"
            />
          </View>
        </View>
        <Button label="Add Participants" onPress={onAddParticipants} variant="brand" />
        <Button label="View Payments" onPress={onViewPayments} variant="outline" />
      </ScrollView>
      <Modal
        animationType="fade"
        onRequestClose={() => setQrViewerVisible(false)}
        transparent
        visible={qrViewerVisible}
      >
        <View style={styles.qrModalBackdrop}>
          <Image
            accessibilityLabel="Full-size class payment QR code"
            resizeMode="contain"
            source={{ uri: qrCodeUri }}
            style={styles.qrModalImage}
          />
          <Pressable
            accessibilityLabel="Close full-size QR code"
            accessibilityRole="button"
            onPress={() => setQrViewerVisible(false)}
            style={styles.qrModalClose}
          >
            <Text style={styles.qrModalCloseLabel}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function ClassSummary({
  classItem,
  organizationName,
  paymentSetting,
  participantsCount,
}: {
  classItem: AdminClass;
  organizationName: string;
  paymentSetting?: AdminClass['payment_setting'];
  participantsCount?: number;
}) {
  const status = classItem.status ?? 'draft';
  const participants =
    participantsCount ?? classItem.participants_count ?? classItem.students_count;
  const schedule = classItem.schedules?.[0];
  const dayOfWeek = schedule?.day_of_week ?? classItem.day_of_week;
  const startTime = schedule?.start_time ?? classItem.start_time;
  const recurrence = schedule?.recurrence_type ?? classItem.frequency;
  const dayTime =
    dayOfWeek !== undefined || startTime
      ? [dayName(dayOfWeek), formatTime(startTime)].filter(Boolean).join(', ')
      : undefined;
  const frequency = recurrence ? capitalize(recurrence) : undefined;
  const paymentAmount =
    classItem.payment_amount ?? classItem.payment_setting?.required_amount ?? null;
  const resolvedPaymentSetting = paymentSetting as
    | {
        bank_name?: string | null;
        bank_account_name?: string | null;
        bank_account_number?: string | null;
      }
    | null
    | undefined;
  const rows = [
    ['Organization', organizationName],
    ['Teacher', classItem.teacher_name ?? '--'],
    ['Day & Time', dayTime ?? '--'],
    ['Frequency', frequency ?? '--'],
    ['Payment Amount', paymentAmount ? `RM ${paymentAmount}` : '--'],
    ['Participants', participants === undefined ? '--' : `${participants} Students`],
    ['Bank Name', resolvedPaymentSetting?.bank_name ?? '--'],
    ['Account Name', resolvedPaymentSetting?.bank_account_name ?? '--'],
    ['Account Number', resolvedPaymentSetting?.bank_account_number ?? '--'],
  ];

  return (
    <View style={styles.summaryCard}>
      <View style={styles.identityRow}>
        <View style={styles.classIcon}>
          <Ionicons color={colors.info} name="school" size={24} />
        </View>
        <Text numberOfLines={1} style={styles.className}>
          {classItem.name}
        </Text>
        <StatusBadge label={capitalize(status)} tone={status === 'active' ? 'success' : 'neutral'} />
      </View>
      {classItem.description ? (
        <Text style={styles.description}>{classItem.description}</Text>
      ) : null}
      <View style={styles.details}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function dayName(dayOfWeek?: number) {
  if (dayOfWeek === undefined) return undefined;
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
}

function formatTime(value?: string | null) {
  if (!value) return undefined;
  const [hour = 0, minute = 0] = value.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: spacing.md,
  },
  headerButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  headerActions: { alignItems: 'center', flexDirection: 'row' },
  pressed: { opacity: 0.65 },
  headerTitle: { ...typography.title, color: colors.text },
  container: { gap: spacing.md, padding: spacing.md },
  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  identityRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  classIcon: {
    alignItems: 'center',
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  className: { ...typography.title, color: colors.text, flex: 1 },
  description: { ...typography.caption, color: colors.mutedText, marginTop: spacing.sm },
  details: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  detailRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 2 },
  detailLabel: { ...typography.caption, color: colors.mutedText, width: 110 },
  detailValue: { ...typography.caption, color: colors.text, flex: 1 },
  qrCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  qrTitle: { ...typography.label, color: colors.text },
  qrPlaceholder: { alignItems: 'center', gap: spacing.xs, padding: spacing.lg },
  qrHint: { ...typography.caption, color: colors.mutedText },
  qrImage: { height: 220, marginVertical: spacing.md, width: 220 },
  qrModalBackdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  qrModalImage: { backgroundColor: colors.surface, height: 320, width: 320 },
  qrModalClose: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  qrModalCloseLabel: { ...typography.label, color: colors.text },
  qrActions: { flexDirection: 'row', gap: spacing.sm },
});
