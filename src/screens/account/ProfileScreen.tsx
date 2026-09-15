import { StyleSheet, Text, View } from 'react-native';

import { Card, DateText, EmptyState, ErrorState, Skeleton, StatusBadge } from '../../components';
import { useProfile } from '../../hooks/useProfile';
import { colors, spacing, typography } from '../../theme';

export function ProfileScreen() {
  const profileQuery = useProfile();
  const user = profileQuery.data;
  if (profileQuery.isLoading) return <Skeleton height={320} />;
  if (profileQuery.isError) {
    return (
      <ErrorState
        message="Unable to load your profile."
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }
  if (!user)
    return (
      <EmptyState title="Profile unavailable" description="Sign in again to view your profile." />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Card>
        <ProfileRow label="Name" value={user.name} />
        <ProfileRow label="Phone" value={user.phone} />
        <ProfileRow label="Email" value={user.email ?? 'Not provided'} />
        <ProfileRow label="User type" value={user.user_type} />
        <ProfileRow
          label="Status"
          value={
            <StatusBadge
              label={user.status}
              tone={user.status.toLowerCase() === 'active' ? 'success' : 'neutral'}
            />
          }
        />
        <ProfileRow
          label="Phone verified"
          value={
            user.phone_verified_at ? (
              <DateText style={styles.value} value={user.phone_verified_at} />
            ) : (
              'Not verified'
            )
          }
        />
        <ProfileRow
          label="Last login"
          value={
            user.last_login_at ? (
              <DateText style={styles.value} value={user.last_login_at} />
            ) : (
              'Not available'
            )
          }
        />
      </Card>
    </View>
  );
}

function ProfileRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {typeof value === 'string' ? <Text style={styles.value}>{value}</Text> : value}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, gap: spacing.md, padding: spacing.md },
  title: { ...typography.heading, color: colors.text },
  row: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: { ...typography.bodySmall, color: colors.mutedText },
  value: { ...typography.bodySmall, color: colors.text, fontWeight: '600', textAlign: 'right' },
});
