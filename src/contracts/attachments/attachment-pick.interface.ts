import type { PickedAttachment } from "./picked-attachment.interface";
import type { RefusedPick } from "./refused-pick.interface";

/** What one pick came back with: the ones counted, and the ones that could not be, each on its own. */
export interface AttachmentPick {
  picked: PickedAttachment[];
  refused: RefusedPick[];
}
