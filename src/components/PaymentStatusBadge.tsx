import { StatusBadge } from './StatusBadge';

import type { PaymentStatus } from '../types/student';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() ?? '';
  const tone =
    normalizedStatus === 'paid'
      ? 'success'
      : normalizedStatus === 'overdue' || normalizedStatus === 'failed'
        ? 'danger'
        : normalizedStatus === 'upcoming' ||
            normalizedStatus === 'pending' ||
            normalizedStatus === 'initiated'
          ? 'warning'
          : normalizedStatus === 'partially_paid' || normalizedStatus === 'refunded'
            ? 'info'
            : 'neutral';

  return <StatusBadge label={status?.replace(/_/g, ' ') ?? 'Unknown'} tone={tone} />;
}
