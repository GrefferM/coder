/**
 * Note about a finished write or an outside change; `reason` is what stopped a write. A refusal is shown in red, leaves
 * by itself and offers no retry; `act` is the one thing it leads to, where it leads anywhere.
 */
export interface WriteNote {
  label: string;
  detail: string | null;
  reason: string | null;
  isRefusal: boolean;
  act: NoteAct | null;
}

/** The word of the act on the line, and what a press on it does. */
export interface NoteAct {
  label: string;
  onPress: () => void;
}
