import type { Agent } from "../../../contracts/project";

/** An agent with both of its numbers written — the only kind a turn can be asked of. */
export interface FilledAgent extends Agent {
  maxCalls: number;
  temperature: number;
}
