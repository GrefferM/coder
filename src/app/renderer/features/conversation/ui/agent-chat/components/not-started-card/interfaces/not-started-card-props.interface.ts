import type { TurnLength } from "../../../../../interfaces";
import type { NotStartedReason } from "../../../../../../../interfaces";

export interface NotStartedCardProps {
  reason: NotStartedReason;
  /** The sentence the app already says about it, in plain words. */
  note: string;
  /** What would have gone, in characters; `null` on every reason but the one the ceiling refused. */
  wouldGo: TurnLength | null;
  /** Said under the card while the person's own words really stand in the field. */
  isAsked: boolean;
  /** Runs the card's own act; `null` where the act cannot be offered here. */
  onAct: (() => void) | null;
  /** This card is where the search stopped — it wears the edge that says so. */
  isFound?: boolean;
}
