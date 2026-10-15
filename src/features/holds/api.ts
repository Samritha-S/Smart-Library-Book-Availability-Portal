import { mockStorage } from '../mock/storage';
import type { HoldItem } from '../mock/types';

export type { HoldItem, HoldStatus } from '../mock/types';

/**
 * Returns student active holds:
 * hold_id, title, cover_url, queue_position, status ('waiting' | 'ready'), pickup_deadline
 */
export async function my_holds(): Promise<HoldItem[]> {
  await new Promise((r) => setTimeout(r, 60));
  return mockStorage.getHolds();
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
  await new Promise((r) => setTimeout(r, 200));
  return mockStorage.placeHold(book);
}

/**
 * Cancels a hold. Can be undone with undo_cancel_hold.
 */
export async function cancel_hold(
  hold_id: string
): Promise<{ success: boolean; hold?: HoldItem }> {
  await new Promise((r) => setTimeout(r, 100));
  return mockStorage.cancelHold(hold_id);
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
