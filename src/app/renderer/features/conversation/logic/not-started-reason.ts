import { MACHINE_WALLS } from "../constants";
import type { MachineWall } from "../interfaces";

/**
 * Which of the machine's walls a turn was refused by, or `null` where the turn was tried and fell. The code is
 * looked for inside the sentence Electron wraps around it, not matched.
 */
export function notStartedReason(failure: string): MachineWall | null {
  const found = Object.entries(MACHINE_WALLS).find(([code]) => failure.includes(code));

  return found === undefined ? null : found[1];
}
