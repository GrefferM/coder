import type { PackedAttachment } from "../../../../../contracts";

/** The repeats of one question: the sphere they go to, what goes each time, how many went, and how many in all. */
export interface RepeatCycle {
  agentId: string;
  text: string;
  attached: PackedAttachment[];
  sent: number;
  total: number;
}
