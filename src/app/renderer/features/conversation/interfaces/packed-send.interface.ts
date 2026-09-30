import type { PackedAttachment, PickedAttachment } from "../../../interfaces";

/** A question with files, as handed over to be packed and then sent. */
export interface PackedSend {
  /** The stream the question was typed in; it is sent only there. */
  stream: string;
  text: string;
  picked: PickedAttachment[];
  /** The ceiling of the model the agent is asked with; how far the files may be read. */
  ceiling: number;
  /** The question goes, with its files packed. */
  onPacked: (packed: PackedAttachment[]) => void;
  /** Returns the question and its attachments to the field; nothing is sent. */
  onGivenBack: () => void;
}
