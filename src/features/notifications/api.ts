import { mockStorage } from '../mock/storage';
import type { NotificationItem } from '../mock/types';

export type { NotificationItem, NotificationType } from '../mock/types';

/**
 * Returns notifications for student:
 * Types: 'hold_ready' | 'due_soon' | 'overdue_notice'
 */
export async function my_notifications(): Promise<NotificationItem[]> {
  await new Promise((r) => setTimeout(r, 60));
  return mockStorage.getNotifications();
}

/**
 * Mark a single notification as read
 */
export async function mark_notification_read(
  notification_id: string
): Promise<{ success: boolean }> {
  return mockStorage.markNotificationRead(notification_id);
}

/**
 * Mark all notifications as read
 */
export async function mark_all_notifications_read(): Promise<{ success: boolean }> {
  return mockStorage.markAllNotificationsRead();
}
