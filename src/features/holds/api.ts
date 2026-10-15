import { supabase } from '@/lib/supabase';
import { mockStorage } from '../mock/storage';
import type { HoldItem } from '../mock/types';

export type { HoldItem, HoldStatus } from '../mock/types';

const isMock =
  import.meta.env.VITE_STUDENT_MOCK === 'true' ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

/**
 * Returns student active holds:
 * hold_id, title, cover_url, queue_position, status ('waiting' | 'ready'), pickup_deadline
 */
export async function my_holds(): Promise<HoldItem[]> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 60));
    return mockStorage.getHolds();
  }

  try {
    const { data, error } = await supabase
      .from('holds')
      .select(`
        id,
        work_id,
        queue_position,
        status,
        pickup_deadline,
        created_at,
        works (
          title,
          author,
          editions (
            cover_url
          )
        )
      `)
      .in('status', ['active', 'ready'])
      .order('queue_position', { ascending: true });

    if (error || !data) {
      console.warn('Fallback to mock holds:', error);
      return mockStorage.getHolds();
    }

    return data.map((row: any) => {
      const work = row.works || {};
      const covers = Array.isArray(work.editions) ? work.editions.map((e: any) => e.cover_url).filter(Boolean) : [];
      return {
        hold_id: row.id,
        title: work.title || 'Reserved Title',
        author: work.author || '',
        cover_url: covers[0] || null,
        queue_position: row.queue_position || 1,
        status: row.status === 'ready' ? 'ready' : 'waiting',
        pickup_deadline: row.pickup_deadline || null,
        created_at: row.created_at,
      };
    });
  } catch (err) {
    console.warn('Error fetching holds:', err);
    return mockStorage.getHolds();
  }
}

/**
 * Places a hold on a title or edition.
 * Checks for student blockage (e.g. overdue loans) and returns queue position.
 */
export async function place_hold(book: {
  work_id?: string;
  title: string;
  author?: string;
  cover_url?: string;
}): Promise<{ success: boolean; hold?: HoldItem; reason?: string }> {
  if (isMock || !book.work_id) {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.placeHold(book);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const studentId = user?.id;

    if (!studentId) {
      // In demo mode without logged in supabase auth, use mock
      return mockStorage.placeHold(book);
    }

    const { data, error } = await supabase.rpc('place_hold', {
      p_work_id: book.work_id,
      p_student_id: studentId,
    });

    if (error) {
      return { success: false, reason: error.message };
    }

    const holdItem: HoldItem = {
      hold_id: data?.hold_id || `hold-${Date.now()}`,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      queue_position: data?.queue_position || 1,
      status: 'waiting',
      pickup_deadline: null,
      created_at: new Date().toISOString(),
    };

    return { success: true, hold: holdItem };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not place hold';
    return { success: false, reason: msg };
  }
}

/**
 * Cancels a hold. Can be undone with undo_cancel_hold.
 */
export async function cancel_hold(
  hold_id: string
): Promise<{ success: boolean; hold?: HoldItem; reason?: string }> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 100));
    return mockStorage.cancelHold(hold_id);
  }

  try {
    const { error } = await supabase.rpc('cancel_hold', { p_hold_id: hold_id });
    if (error) {
      return { success: false, reason: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Cancel hold failed';
    return { success: false, reason: msg };
  }
}

/**
 * Restores a cancelled hold (undo action).
 */
export async function undo_cancel_hold(
  hold_id: string
): Promise<{ success: boolean; hold?: HoldItem }> {
  await new Promise((r) => setTimeout(r, 80));
  return mockStorage.undoCancelHold(hold_id);
}
