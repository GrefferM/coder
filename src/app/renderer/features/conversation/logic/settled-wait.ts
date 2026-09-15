import type { IncomingWork, WaitedWork } from "../interfaces";

/**
 * One supplier of a converging point has had its turn: what arrived is added to what is held, and the supplier
 * counts as settled whether it answered or not. A walk that broke leaves the point standing for the repeat.
 */
export function settledWait(
  standing: WaitedWork,
  fromId: string,
  work: IncomingWork | null,
  via: string | null,
  isBroken: boolean,
): WaitedWork {
  return {
    ...standing,
    settledIds: standing.settledIds.includes(fromId) ? standing.settledIds : [...standing.settledIds, fromId],
    arrived: work === null ? standing.arrived : [...standing.arrived, work],
    viaLinkIds: work === null || via === null ? standing.viaLinkIds : [...standing.viaLinkIds, via],
    isAwaitingRepeat: standing.isAwaitingRepeat || isBroken,
  };
}

/** Whether every live supplier has had its turn. */
export function isWaitOver(stood: WaitedWork): boolean {
  if (stood.isAwaitingRepeat) {
    return false;
  }

  return stood.awaitedIds.every((supplierId) => stood.settledIds.includes(supplierId));
}
