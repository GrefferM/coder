import type { PickedAttachment } from "./picked-attachment.interface";
import type { RefusedPick } from "./refused-pick.interface";

export interface AttachmentPick {
  picked: PickedAttachment[];
  refused: RefusedPick[];
}
