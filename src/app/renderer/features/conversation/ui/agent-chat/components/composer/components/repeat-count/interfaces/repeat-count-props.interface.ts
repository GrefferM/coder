import type { RepeatProgress } from "../../../../../../../interfaces";

export interface RepeatCountProps {
  /** How many times the next question goes. */
  repeats: number;
  /** Repeats under way: the count reads «2/5» and is not changed. */
  repeating: RepeatProgress | null;
  /** The count is changed only where a question could go or wait. */
  isShut: boolean;
  onRepeats: (count: number) => void;
}
