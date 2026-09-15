import type { PaginationMeta } from './student';

export type NotificationType =
  | 'payment.reminder'
  | 'payment.success'
  | 'payment.failed'
  | 'payment.overdue'
  | 'payment.pending'
  | 'class.added'
  | 'class.removed'
  | 'system.notification';

export interface AppNotification {
  id: number | string;
  type: NotificationType | string;
  title: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export interface NotificationListResponse {
  data: {
    notifications: AppNotification[];
    pagination: PaginationMeta;
  };
}
