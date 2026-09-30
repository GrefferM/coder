import { isOnScreen } from "./is-on-screen";
import type { WalkState } from "../interfaces";
import type { WaitingAgent, WaitingSupplier } from "../../../interfaces";

/**
 * Every point of the conversation on screen holding work while lines converge, and where each supplier stands:
 * answered, still out, or settled with nothing. Suppliers keep the order their lines were drawn in.
 */
export function waitingAgents(walk: WalkState): WaitingAgent[] {
  const shown: Record<string, WaitingAgent & { askedAt: number }> = {};

  for (const [runKey, held] of Object.entries(walk.walks)) {
    // The canvas is one conversation's — a point of another one is not drawn and not counted here.
    if (!isOnScreen(walk, runKey)) {
      continue;
    }

    for (const [agentId, stood] of Object.entries(held.waiting)) {
      // A point that does not wait holds a tally, not a wait, and shows no pill.
      if (stood.isSilent) {
        continue;
      }

      const standing = shown[agentId];

      if (standing !== undefined && standing.askedAt > held.askedAt) {
        continue;
      }

      shown[agentId] = {
        agentId,
        askedAt: held.askedAt,
        isAwaitingRepeat: stood.isAwaitingRepeat,
        suppliers: stood.awaitedIds.map<WaitingSupplier>((supplierId) => {
          const arrived = stood.arrived.find((one) => one.fromAgentId === supplierId) ?? null;

          return {
            agentId: supplierId,
            state: arrived !== null ? "answered" : stood.settledIds.includes(supplierId) ? "silent" : "working",
            seconds: arrived === null ? null : arrived.seconds,
          };
        }),
      };
    }
  }

  return Object.values(shown).map(({ askedAt: _askedAt, ...waiting }) => waiting);
}
