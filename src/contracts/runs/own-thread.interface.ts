import type { ThreadStep } from "./thread-step.interface";
import type { WholeMemory } from "./whole-memory.interface";

/**
 * An agent's own thread in one run as the record holds it: the compression of it paid in the latest step, if any, and
 * the agent's steps after the place that compression covers, in the order they ran.
 */
export interface OwnThread {
  composed: WholeMemory | null;
  steps: ThreadStep[];
}
