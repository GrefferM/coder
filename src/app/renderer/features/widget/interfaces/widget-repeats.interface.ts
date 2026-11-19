import type { PackedAttachment } from "../../../../../contracts";
import type { RepeatProgress } from "../../conversation";

/** «x1» in the widget: how many times the next question goes, the repeats under way, and the send that counts them. */
export interface WidgetRepeats {
  repeats: number;
  repeating: RepeatProgress | null;
  setRepeats: (count: number) => void;
  /** Puts the question to a sphere, and again each time its walk ends, as many times as the count; false where it did not go. */
  send: (agentId: string, text: string, attached: PackedAttachment[]) => Promise<boolean>;
  /** «ЗУПИНИТИ»: no repeat goes after the walk out. */
  drop: () => void;
}
