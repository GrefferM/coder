import type { PackedAttachment } from "../../../../../interfaces";

/** Repeats under way: one question put again, each time as a question of its own, after the walk before ends whole. */
export interface RepeatCycle {
  /** Whom the question goes to; read from the project each time, so a deleted agent ends the repeats. */
  agentId: string;
  text: string;
  /** The files packed for the first question; every repeat carries the same. */
  attached: PackedAttachment[];
  /** The walk out; `null` while the first question is still packing. */
  runKey: string | null;
  /** How many have gone, the one out included. */
  sent: number;
  total: number;
}
