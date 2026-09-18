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
        message="Tidak dapat memuatkan profil anda."
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }
  if (!user)
    return (
      <EmptyState title="Profil tidak tersedia" description="Log masuk semula untuk melihat profil anda." />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Card>
        <ProfileRow label="Nama" value={user.name} />
        <ProfileRow label="Telefon" value={user.phone} />
        <ProfileRow label="E-mel" value={user.email ?? 'Tiada'} />
        <ProfileRow
          label="Status"
          value={
            <StatusBadge
              label={user.status.toLowerCase() === 'active' ? 'Aktif' : user.status}
              tone={user.status.toLowerCase() === 'active' ? 'success' : 'neutral'}
            />
          }
        />
        <ProfileRow
          label="Telefon disahkan"
          value={
            user.phone_verified_at ? (
              <DateText style={styles.value} value={user.phone_verified_at} />
            ) : (
              'Belum disahkan'
            )
          }
        />
        <ProfileRow
          label="Log masuk terakhir"
          value={
            user.last_login_at ? (
              <DateText style={styles.value} value={user.last_login_at} />
            ) : (
              'Tiada'
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
