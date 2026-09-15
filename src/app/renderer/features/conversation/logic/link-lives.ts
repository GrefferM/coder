import { isOnScreen } from "./is-on-screen";
import type { Link, LinkLife } from "../../../interfaces";
import type { WaitedWork, WalkState } from "../interfaces";

/** Where one supplier of a converging point stands, or `null` where this line is no supplier of it. */
function supplierLife(stood: WaitedWork, fromAgentId: string): LinkLife | null {
  if (stood.arrived.some((one) => one.fromAgentId === fromAgentId)) {
    return "answered";
  }

  if (stood.settledIds.includes(fromAgentId)) {
    return "silent";
  }

  return stood.awaitedIds.includes(fromAgentId) ? "awaited" : null;
}

/**
 * The life of every line of the canvas now: work flowing down, or an agent waiting on its suppliers. The two
 * never meet — a wait is let go the moment its turn begins. A line with no life is left out, and only the
 * conversation on screen gives life at all.
 */
export function linkLives(links: Link[], walk: WalkState): Record<string, LinkLife> {
  const lives: Record<string, LinkLife> = {};

  for (const standing of Object.values(walk.out)) {
    if (!isOnScreen(walk, standing.runKey)) {
      continue;
    }

    for (const linkId of standing.viaLinkIds) {
      lives[linkId] = "running";
    }
  }

  for (const [runKey, held] of Object.entries(walk.walks)) {
    if (!isOnScreen(walk, runKey)) {
      continue;
    }

    for (const [agentId, stood] of Object.entries(held.waiting)) {
      for (const link of links.filter((one) => one.to === agentId)) {
        const life = supplierLife(stood, link.from);

        if (life !== null) {
          lives[link.id] = life;
        }
      }
    }
  }

  return lives;
}
