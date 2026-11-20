import type { RepeatProgress } from "../../conversation";
import type { WidgetQuestion } from "./widget-question.interface";

/** «x1» in the widget: how many times the next question goes, the repeats under way, and the send that counts them. */
export interface WidgetRepeats {
  repeats: number;
  repeating: RepeatProgress | null;
  setRepeats: (count: number) => void;
  /**
   * Puts the question to its sphere, and again each time its walk ends, as many times as the count, the recordings
   * going with the first alone; false where it did not go.
   */
  send: (question: WidgetQuestion) => Promise<boolean>;
  /** «ЗУПИНИТИ»: no repeat goes after the walk out. */
  drop: () => void;
}
