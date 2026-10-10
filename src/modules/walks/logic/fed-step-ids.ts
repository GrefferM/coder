import type { IncomingWork, RunLedger } from "../../../contracts";

/**
 * The steps a turn's work came from: those the record names for a walk picked up from it, else the supplier's own last
 * step in this walk; none while no row is open.
 */
export function fedStepIds(ledger: RunLedger | null, incoming: IncomingWork[]): string[] {
  if (ledger === null) {
    return [];
  }

  return incoming.flatMap((one) => {
    const standing = one.fromAgentId === null ? undefined : ledger.stepIdOf[one.fromAgentId];

    return one.fromStepIds.length > 0 ? one.fromStepIds : standing === undefined ? [] : [standing];
  });
}
