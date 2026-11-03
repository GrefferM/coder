import { PICK_ATTACHMENT_CHANNEL } from "../../../../../contracts";
import type { AttachmentPick } from "../../../../../contracts";

/** Native pick: counted entries come back named and weighed, unread; refused ones with why (too big or unreadable). */
export async function pickAttachment(room: number | null): Promise<AttachmentPick> {
  return window.electronApi.invoke(PICK_ATTACHMENT_CHANNEL, {
    room,
  });
}
