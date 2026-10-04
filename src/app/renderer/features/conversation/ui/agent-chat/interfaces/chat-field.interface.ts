import type { PickedAttachment } from "../../../../../interfaces";
import type { RepeatProgress } from "../../../interfaces";
/** The field under the stream: its text, its height and its two acts. */
export interface ChatField {
  draft: string;
  /** The height the person pulled this project's field to; `null` if never pulled. */
  height: number | null;
  /** A walk is out somewhere and not released; «ЗУПИНИТИ» stands for all of it, even over an opened run. */
  isWalking: boolean;
  onDraftChange: (draft: string) => void;
  onHeight: (height: number) => void;
  /** Attachments waiting to go with the question, shown as chips; empty for none. */
  attachments: PickedAttachment[];
  onAttach: () => void;
  onDetach: (path: string) => void;
  onSend: () => void;
  onStop: () => void;
  /** «x1»: how many times the next question goes in a row. */
  repeats: number;
  onRepeats: (count: number) => void;
  /** Repeats under way, for «2/5»; the field is shut while they go. */
  repeating: RepeatProgress | null;
}
