import type { TakenThings } from "../../../../../contracts/project";
import type { Point } from "../../../utils/math";

/** One deletion's standing offer to put it back, with its own thirty seconds. */
export interface UndoOffer {
  id: string;
  /** The deletion's history row; `null` when the history refused it. */
  deletionId: string | null;
  taken: TakenThings;
  message: string;
  /** Where the thing stood while the trace is drawn; `null` once gone. */
  place: Point | null;
  secondsLeft: number;
}
