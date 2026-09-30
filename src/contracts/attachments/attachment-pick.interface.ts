import type { PickedAttachment } from "./picked-attachment.interface";
import type { RefusedPick } from "./refused-pick.interface";

/** One pick's result: the counted files and the refused ones, each separately. */
export interface AttachmentPick {
  picked: PickedAttachment[];
  refused: RefusedPick[];
}
