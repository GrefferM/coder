/** The field under the stream: what is typed in it, how tall it stands, and the two acts of it. */
export interface ChatField {
  draft: string;
  /** How tall the person pulled the field of this project; nothing where they never pulled it. */
  height: number | null;
  /** A walk is out somewhere and nobody has let it go; «ЗУПИНИТИ» stands for all of it, even over an opened run. */
  isWalking: boolean;
  onDraftChange: (draft: string) => void;
  onHeight: (height: number) => void;
  onSend: () => void;
  onStop: () => void;
}
