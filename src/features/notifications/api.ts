import { supabase } from '@/lib/supabase';
import { mockStorage } from '../mock/storage';
import type { NotificationItem } from '../mock/types';

export type { NotificationItem, NotificationType } from '../mock/types';

const isMock =
  import.meta.env.VITE_STUDENT_MOCK === 'true' ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

/**
 * Returns notifications for student:
 * Types: 'hold_ready' | 'due_soon' | 'overdue_notice'
 */
export async function my_notifications(): Promise<NotificationItem[]> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 60));
    return mockStorage.getNotifications();
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) {
      return mockStorage.getNotifications();
    }

    return data.map((n: any) => ({
      id: n.id,
      type: n.type || 'due_soon',
      title: n.title,
      message: n.message,
      created_at: n.created_at,
      read: n.read || false,
      link_tab: n.type === 'hold_ready' ? 'holds' : 'borrowed',
    }));
  } catch (err) {
    console.warn('Error fetching notifications:', err);
    return mockStorage.getNotifications();
  }
}

/**
 * Mark a single notification as read
 */
export async function mark_notification_read(
  notification_id: string
): Promise<{ success: boolean }> {
  if (isMock) {
    return mockStorage.markNotificationRead(notification_id);
  }

  try {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification_id);
    return { success: true };
  } catch {
    return mockStorage.markNotificationRead(notification_id);
  }
}

/**
 * Mark all notifications as read
 */
export async function mark_all_notifications_read(): Promise<{ success: boolean }> {
  if (isMock) {
    return mockStorage.markAllNotificationsRead();
  }

  try {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);
    return { success: true };
  } catch {
    return mockStorage.markAllNotificationsRead();
  }
}
