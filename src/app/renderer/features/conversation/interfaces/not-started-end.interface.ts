import type { NotStartedAct } from "./not-started-act.type";

/** Per reason: the sphere's word, the one act offered, and the record's word for a step that ended there. */
export interface NotStartedEnd {
  /** Null where the card carries no word of its own. */
  label: string | null;
  actLabel: string;
  act: NotStartedAct;
  state: string;
}
