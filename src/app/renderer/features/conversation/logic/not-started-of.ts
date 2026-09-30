import { NOT_STARTED_ENDS } from "../constants";
import type { NotStartedReason } from "../../../interfaces";

/** The reason of the family a step never began for, or null where the turn ran. */
export function notStartedOf(state: string): NotStartedReason | null {
  const found = Object.entries(NOT_STARTED_ENDS).find(([, end]) => end.state === state);

  return found === undefined ? null : (found[0] as NotStartedReason);
}
