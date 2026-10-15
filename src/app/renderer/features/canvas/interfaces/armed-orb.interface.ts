import type { ArmedMarkRow } from "./armed-mark-row.interface";
import type { OrbHint } from "./orb-hint.interface";
import type { ToolSource } from "../../../interfaces";

/** One mini-sphere on an agent's arc: a single source, or its kind's «+» that folds the rest. */
export interface ArmedOrb {
  /** The source this stands for; null for a «+». */
  group: string | null;
  /** The grant behind a command's or agent's mark; null for a server's mark and a «+». */
  grantId: string | null;
  /** The source's colour; on a «+», the colour of the kind it folds. */
  color: string;
  /** Set only on a «+»: the count of marks in one kind, e.g. «+5». */
  more: string | null;
  /** What a «+» hides; null on a mark of its own. */
  folded: ArmedMarkRow[] | null;
  /** The kind of source, shown by the mark's shape; a «+» takes the kind it folds. */
  source: ToolSource;
  /** Everything this mark stands for points at nothing; on a «+», at least one source behind it does. */
  isBroken: boolean;
  /** What it says under the cursor. */
  hint: OrbHint;
}
