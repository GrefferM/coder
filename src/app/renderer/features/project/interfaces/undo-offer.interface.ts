import type { TakenThings } from "../../../../../contracts/project";
import type { Point } from "../../../utils/math";

/** One deletion's standing offer to put it back, with its own thirty seconds. */
export interface UndoOffer {
  id: string;
  /** The deletion's row in the history; `null` when the history refused to remember it. */
  deletionId: string | null;
  taken: TakenThings;
  message: string;
  /** Where the thing stood, while the trace is still drawn there; `null` once it has gone out. */
  place: Point | null;
  secondsLeft: number;
}
