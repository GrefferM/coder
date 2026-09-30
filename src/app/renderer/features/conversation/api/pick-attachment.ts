import { PICK_ATTACHMENT_CHANNEL } from "../../../../../contracts";
import type { AttachmentPick } from "../../../../../contracts";

/**
 * Asks the system for files or folders: counted ones come back named and weighed but unread; refused ones come back
 * with why (too big for the room under the ceiling, or unreadable).
 */
export async function pickAttachment(room: number | null): Promise<AttachmentPick> {
  return window.electronApi.invoke(PICK_ATTACHMENT_CHANNEL, {
    room,
  });
}
