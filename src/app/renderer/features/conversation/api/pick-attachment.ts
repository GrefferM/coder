import { PICK_ATTACHMENT_CHANNEL } from "../../../../../contracts";
import type { AttachmentPick } from "../../../../../contracts";

/**
 * Asks the system for files or folders: the ones counted come back named and weighed but not read, and the ones
 * not attached come back with why — too big for the room left under the ceiling, or not ours to read.
 */
export async function pickAttachment(room: number | null): Promise<AttachmentPick> {
  return window.electronApi.invoke(PICK_ATTACHMENT_CHANNEL, {
    room,
  });
}
