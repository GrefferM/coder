import type { PickedAttachment } from "../../../../../interfaces";
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
}
