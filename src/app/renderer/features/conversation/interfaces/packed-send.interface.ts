import type { PackedAttachment, PickedAttachment } from "../../../interfaces";

/** A question with files attached, as it is handed over to be packed and then sent. */
export interface PackedSend {
  /** The stream the question was typed in; it is sent there and nowhere else. */
  stream: string;
  text: string;
  picked: PickedAttachment[];
  /** The ceiling of the model the agent is asked with — how far the files may be read. */
  ceiling: number;
  /** The question goes, with its files packed. */
  onPacked: (packed: PackedAttachment[]) => void;
  /** The question comes back to its field with what was attached to it, and nothing is sent. */
  onGivenBack: () => void;
}
