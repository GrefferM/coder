import type { SpeechNote } from "../../speech";

/** The widget's one line and the way to say something on it. */
export interface WidgetNoteState {
  note: SpeechNote | null;
  say: (note: SpeechNote) => void;
}
