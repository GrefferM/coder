import type { PickedAttachment } from "../../../interfaces";
import type { HeardClip } from "../../speech";

/** A question that did not go, returned to the field of its stream with everything it took. */
export interface FieldReturn {
  at: string;
  text: string;
  picked: PickedAttachment[];
  clips: HeardClip[];
}
