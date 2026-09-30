import type { TurnLength } from "../../../../../interfaces";
import type { NotStartedReason } from "../../../../../../../interfaces";

export interface NotStartedCardProps {
  reason: NotStartedReason;
  /** The sentence the app already says about it, in plain words. */
  note: string;
  /** What would have gone, in characters; `null` for every reason but the ceiling. */
  wouldGo: TurnLength | null;
  /** Whether the person's own words stand in the field, so the card says so. */
  isAsked: boolean;
  /** Runs the card's act; `null` where it cannot be offered. */
  onAct: (() => void) | null;
  /** This card is where the search stopped, so it wears the edge. */
  isFound?: boolean;
}
