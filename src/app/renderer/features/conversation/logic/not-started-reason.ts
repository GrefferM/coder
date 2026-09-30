import { MACHINE_WALLS } from "../constants";
import type { MachineWall } from "../interfaces";

/**
 * The machine's wall that refused a turn, or `null` where the turn was tried and fell. The code is searched for inside
 * Electron's wrapping sentence, not matched exactly.
 */
export function notStartedReason(failure: string): MachineWall | null {
  const found = Object.entries(MACHINE_WALLS).find(([code]) => failure.includes(code));

  return found === undefined ? null : found[1];
}
