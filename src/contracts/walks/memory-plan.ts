import type { MemorySettings } from "../project";
import type { MemoryPlan } from "./memory-plan.interface";
import type { TurnLength } from "./turn-length.interface";

/**
 * What a kept memory is given of the ceiling, in characters: the agent's target share, rounded up so it is never
 * written down short.
 */
export function memoryReserve(compressTo: number, ceiling: number): number {
  return Math.ceil((compressTo * ceiling) / 100);
}

/** Where the agent's memory is compressed, in characters, rounded up as the reserve is. */
export function memoryThreshold(compressAt: number, ceiling: number): number {
  return Math.ceil((compressAt * ceiling) / 100);
}

/**
 * What to do about the memory before this turn: below the threshold it goes as it stands, at it the memory is
 * compressed to the target. The system prompt and the question are never compressed, so with the target's share they
 * must stay under the threshold, or the memory just compressed would be compressed again by the next turn: that is the
 * one wall. An agent whose memory is off goes while the turn fits the ceiling.
 */
export function memoryPlan(agent: MemorySettings, length: TurnLength): MemoryPlan {
  const { prompt, asked, total, ceiling } = length;

  if (agent.memory === "none") {
    return total > ceiling
      ? {
          kind: "wall",
          reserve: 0,
          limit: ceiling,
        }
      : {
          kind: "go",
        };
  }

  const reserve = memoryReserve(agent.compressTo, ceiling);

  // Whole percents on both sides, so the edge is exact: reaching the threshold with the reserve is already a wall.
  if ((prompt + asked + reserve) * 100 >= agent.compressAt * ceiling) {
    return {
      kind: "wall",
      reserve,
      limit: memoryThreshold(agent.compressAt, ceiling),
    };
  }

  if (total * 100 < agent.compressAt * ceiling) {
    return {
      kind: "go",
    };
  }

  return {
    kind: "compress",
    budget: reserve,
    at: agent.compressAt,
    to: agent.compressTo,
  };
}
