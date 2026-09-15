import type { IncomingWork, RunLedger } from "../interfaces";

/**
 * The steps a turn's work came from — the ones the record names for a walk picked up out of it,
 * otherwise the supplier's own last step in this walk. A walk with no row open yet names nothing.
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
