import type { PickedAttachment } from "../../../../../interfaces";
/** The field under the stream: what is typed in it, how tall it stands, and the two acts of it. */
export interface ChatField {
  draft: string;
  /** How tall the person pulled the field of this project; nothing where they never pulled it. */
  height: number | null;
  /** A walk is out somewhere and nobody has let it go; «ЗУПИНИТИ» stands for all of it, even over an opened run. */
  isWalking: boolean;
  onDraftChange: (draft: string) => void;
  onHeight: (height: number) => void;
  /** What is attached under the field, waiting to go with the question — chips show it, none where empty. */
  attachments: PickedAttachment[];
  onAttach: () => void;
  onDetach: (path: string) => void;
  onSend: () => void;
  onStop: () => void;
}
