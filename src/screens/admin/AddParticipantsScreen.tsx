import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { adminApi } from '../../api/adminApi';
import { Button, Card, EmptyState, ErrorState, Skeleton, TextInput } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import type { AdminParticipant } from '../../types/admin';
import { CreateParticipantScreen } from './CreateParticipantScreen';

export function AddParticipantsScreen({
  classId,
  className,
  onBack,
}: {
  classId: number | string;
  className: string;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const [participantType, setParticipantType] = useState<'student' | 'sponsor'>('student');
  const [phone, setPhone] = useState('');
  const [searchedPhone, setSearchedPhone] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isCreatingParticipant, setIsCreatingParticipant] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const participantsQuery = useQuery({
    queryKey: ['admin', 'classes', classId, 'participants'],
    queryFn: () => adminApi.getClassParticipants(classId),
  });
  const participants = participantsQuery.data?.data ?? [];
  const peopleQuery = useQuery({
    queryKey: ['admin', participantType, 'phone-search', searchedPhone],
    queryFn: () =>
      participantType === 'student'
        ? adminApi.searchAdminStudents(searchedPhone)
        : adminApi.searchAdminSponsors(searchedPhone),
    enabled: searchedPhone.length > 0,
  });
  const searchResult = peopleQuery.data?.[0];
  const visibleParticipants = participants.filter((participant) => {
    const type = participant.participant_type?.toLowerCase();
    return !type || type === participantType;
  });

  const searchByPhone = () => {
    const normalizedPhone = phone.trim();
    if (!normalizedPhone) return;
    setHasSearched(true);
    setSearchedPhone(normalizedPhone);
  };

  const addParticipant = async () => {
    if (!searchResult) return;
    setErrorMessage(null);
    setIsAdding(true);
    try {
      await adminApi.addClassParticipant(classId, {
        participant_type: participantType,
        user_id: searchResult.id,
      });
      setPhone('');
      setSearchedPhone('');
      setHasSearched(false);
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'classes', classId, 'participants'],
      });
      Alert.alert('Participant added', `The ${participantType} was added to ${className}.`);
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
    } finally {
      setIsAdding(false);
    }
  };

  if (participantsQuery.isLoading) return <Skeleton height={420} />;
  if (participantsQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(participantsQuery.error).message}
        onRetry={() => void participantsQuery.refetch()}
      />
    );

  if (isCreatingParticipant)
    return (
      <CreateParticipantScreen
        classId={classId}
        className={className}
        onBack={() => setIsCreatingParticipant(false)}
        onCreated={() => setIsCreatingParticipant(false)}
        participantType={participantType}
      />
    );

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to class details"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.headerButton}
        >
          <Ionicons color={colors.text} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Participants</Text>
        <View style={styles.headerButton} />
      </View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.tabs}>
          <RoleTab
            active={participantType === 'student'}
            label="Students"
            onPress={() => {
              setParticipantType('student');
              setSearchedPhone('');
              setHasSearched(false);
            }}
          />
          <RoleTab
            active={participantType === 'sponsor'}
            label="Sponsors"
            onPress={() => {
              setParticipantType('sponsor');
              setSearchedPhone('');
              setHasSearched(false);
            }}
          />
        </View>
        <Text style={styles.sectionTitle}>
          Add {participantType === 'student' ? 'Student' : 'Sponsor'}
        </Text>
        <Text style={styles.fieldLabel}>Phone Number *</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <TextInput
              containerTestID="participant-phone"
              keyboardType="phone-pad"
              label=""
              onChangeText={setPhone}
              onSubmitEditing={searchByPhone}
              placeholder="Enter phone number"
              returnKeyType="search"
              value={phone}
            />
          </View>
          <Pressable
            accessibilityLabel="Search by phone number"
            accessibilityRole="button"
            onPress={searchByPhone}
            style={styles.searchIcon}
          >
            <Ionicons color={colors.info} name="search-outline" size={20} />
          </Pressable>
        </View>
        {peopleQuery.isFetching ? <Text style={styles.searchHint}>Searching...</Text> : null}
        {searchResult && searchedPhone === phone.trim() ? (
          <Card>
            <View style={styles.resultRow}>
              <View style={styles.resultIcon}>
                <Ionicons color={colors.info} name="person-circle" size={26} />
              </View>
              <View style={styles.participantCopy}>
                <Text style={styles.participantName}>{searchResult.name}</Text>
                <Text style={styles.phone}>{searchResult.phone ?? phone}</Text>
                <Text style={styles.searchHint}>Existing {participantType}</Text>
              </View>
              <Button
                fullWidth={false}
                label="Add"
                loading={isAdding}
                onPress={() => void addParticipant()}
                variant="secondary"
              />
            </View>
          </Card>
        ) : null}
        {peopleQuery.isError ? (
          <Text style={styles.noResult}>{normalizeApiError(peopleQuery.error).message}</Text>
        ) : null}
        {hasSearched && !peopleQuery.isFetching && peopleQuery.data?.length === 0 ? (
          <Text style={styles.noResult}>No {participantType} found for this phone number</Text>
        ) : null}
        {errorMessage ? <ErrorState message={errorMessage} /> : null}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.or}>or</Text>
          <View style={styles.divider} />
        </View>
        <Button
          label={`Create New ${participantType === 'student' ? 'Student' : 'Sponsor'}`}
          onPress={() => setIsCreatingParticipant(true)}
          variant="outline"
        />
        <Text style={styles.listTitle}>
          {participantType === 'student' ? 'Student' : 'Sponsor'} List ({visibleParticipants.length}
          )
        </Text>
        {visibleParticipants.length === 0 ? (
          <EmptyState title={`No ${participantType}s in this class`} />
        ) : (
          <View style={styles.list}>
            {visibleParticipants.map((participant, index) => (
              <ParticipantRow index={index} key={participant.id} participant={participant} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function RoleTab({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tab, active && styles.activeTab]}
    >
      <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
    </Pressable>
  );
}

function ParticipantRow({ index, participant }: { index: number; participant: AdminParticipant }) {
  return (
    <Card>
      <View style={styles.participantRow}>
        <View style={styles.index}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={styles.participantCopy}>
          <Text style={styles.participantName}>
            {participant.user?.name ?? participant.name ?? `User ${participant.user_id ?? participant.id}`}
          </Text>
          <Text style={styles.phone}>
            {participant.user?.phone ?? participant.phone ?? `User ID: ${participant.user_id ?? participant.id}`}
          </Text>
        </View>
        <Ionicons color={colors.mutedText} name="ellipsis-vertical" size={18} />
      </View>
    </Card>
  );
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
  headerTitle: { ...typography.title, color: colors.text },
  container: { gap: spacing.md, padding: spacing.md },
  tabs: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    flexDirection: 'row',
    padding: spacing.xxs,
  },
  tab: { borderRadius: radius.sm, flex: 1, paddingVertical: spacing.sm },
  activeTab: { backgroundColor: colors.info },
  tabLabel: { ...typography.caption, color: colors.text, textAlign: 'center' },
  activeTabLabel: { color: colors.onPrimary, fontWeight: '700' },
  sectionTitle: { ...typography.label, color: colors.text },
  fieldLabel: { ...typography.caption, color: colors.text },
  searchRow: { alignItems: 'center', flexDirection: 'row' },
  searchInput: { flex: 1 },
  searchIcon: { marginLeft: spacing.sm, padding: spacing.xs },
  searchHint: { ...typography.caption, color: colors.mutedText },
  noResult: { ...typography.bodySmall, color: colors.mutedText, textAlign: 'center' },
  dividerRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  divider: { backgroundColor: colors.border, flex: 1, height: 1 },
  or: { ...typography.caption, color: colors.mutedText },
  listTitle: { ...typography.label, color: colors.text, marginTop: spacing.sm },
  list: { gap: spacing.sm },
  participantRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  resultRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  resultIcon: {
    alignItems: 'center',
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  index: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  indexText: { ...typography.caption, color: colors.text },
  participantCopy: { flex: 1, gap: spacing.xxs },
  participantName: { ...typography.label, color: colors.text },
  phone: { ...typography.caption, color: colors.mutedText },
});
