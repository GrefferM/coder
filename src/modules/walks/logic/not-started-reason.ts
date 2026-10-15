import { MACHINE_WALLS } from "../../../contracts";
import type { MachineWall } from "../../../contracts";

/**
 * The machine's wall that refused a turn, or `null` where the turn was tried and fell. The code is searched for inside
 * the refusal's message, which may carry words after it, not matched exactly.
 */
export function notStartedReason(failure: string): MachineWall | null {
  const found = Object.entries(MACHINE_WALLS).find(([code]) => failure.includes(code));

  return found === undefined ? null : found[1];
}
