import type { PackedAttachment } from "../../../../../contracts";

/** The repeats of one question: what goes each time, how many went, and how many in all. */
export interface RepeatCycle {
  text: string;
  attached: PackedAttachment[];
  sent: number;
  total: number;
}
