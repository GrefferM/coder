import { isOnScreen } from "../../../../../contracts";
import type { WalkSnapshot } from "../interfaces";
import type { WaitingAgent, WaitingSupplier } from "../../../interfaces";

/**
 * Every point of the conversation on screen holding work while lines converge, with each supplier's state: answered,
 * still out, or settled with nothing; suppliers in line-drawing order.
 */
export function waitingAgents(walk: WalkSnapshot): WaitingAgent[] {
  const shown: Record<string, WaitingAgent & { askedAt: number }> = {};

  for (const [runKey, held] of Object.entries(walk.walks)) {
    // The canvas shows one conversation; a point of another is not drawn or counted.
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
