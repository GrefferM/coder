import type { NotStartedAct } from "./not-started-act.type";

/**
 * What one reason of the family comes to — the sphere's own word for it, the one act it offers, and the word the
 * record keeps for a step that ended there. Every reason offers an act: there is no card the person can only read.
 */
export interface NotStartedEnd {
  label: string;
  actLabel: string;
  act: NotStartedAct;
  state: string;
}
