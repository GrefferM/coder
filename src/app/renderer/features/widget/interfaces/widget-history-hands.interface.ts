import type { SpeechNote } from "../../speech";

export interface WidgetHistoryHands {
  /** The widget's project, by its folder; `null` or `undefined` while none is open. */
  directory: string | null | undefined;
  /** The chosen sphere, whose runs the history lists; `null` while none is chosen. */
  sphereId: string | null;
  /** Says on the widget's line why a run was not deleted. */
  onNote: (note: SpeechNote) => void;
}
