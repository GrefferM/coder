import type { Walk } from "./walk.interface";

/**
 * Whether a walk ended other than whole: gone or put away, stopped, a question or an end the record refused, or any
 * turn that fell, never began or did not go. A repeat goes on only after a whole walk.
 */
export function walkBroke(held: Walk | null): boolean {
  if (held === null || held.isPutAway || held.isStopped || held.unsavedAsk !== null || held.unclosed !== null) {
    return true;
  }

  return held.said.some((said) => said.isFailure || said.notStarted !== null || said.from === "notSent");
}
