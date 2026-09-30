import type { ArmedMarkRow } from "./armed-mark-row.interface";
import type { OrbHint } from "./orb-hint.interface";
import type { ToolSource } from "../../../interfaces";

/** One mini-sphere on the arc over an agent — one source, or its порода's «+» that folds the rest. */
export interface ArmedOrb {
  /** Which source this one stands for; nothing at all for a «+», which stands for no one source. */
  group: string | null;
  /** The one grant behind a command's mark, by its own id; nothing for a server's mark and for a «+». */
  grantId: string | null;
  /** The colour of the source, and on a «+» the colour of the порода it folds. */
  color: string;
  /** Set only on a «+», and it counts marks of one порода — «+5», «+3». */
  more: string | null;
  /** What a «+» hides, so a press can raise the list of it; null on a mark of its own. */
  folded: ArmedMarkRow[] | null;
  /** The kind of source, which the mark's shape says; a «+» wears the kind it folds. */
  source: ToolSource;
  /**
   * Everything this mark stands for points at nothing — the source was granted and the grant
   * has since lost what it pointed at. On a «+» it means at least one source behind it is in that state.
   */
  isBroken: boolean;
  /** What it says under the cursor — the mark itself says nothing at all. */
  hint: OrbHint;
}
