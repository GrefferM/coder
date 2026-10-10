import { NOT_STARTED_STATES } from "../../../contracts";
import type { NotStartedReason } from "../../../contracts";

/** The reason of the family a step never began for, or null where the turn ran. */
export function notStartedOf(state: string): NotStartedReason | null {
  const found = Object.entries(NOT_STARTED_STATES).find(([, held]) => held === state);

  return found === undefined ? null : (found[0] as NotStartedReason);
}
