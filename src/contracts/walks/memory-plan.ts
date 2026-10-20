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
 * What to do about the memory before this turn, in percent of the model's ceiling the agent has written.
 *
 * The system prompt and the question are never compressed, and a kept memory, once compressed, is the target's share of
 * the ceiling, full or not. So the turn's own words must leave room for it below the threshold: words and target
 * together reach it, and the memory just compressed would be compressed again by the very next turn. That is the one
 * wall, and the person can mend it by shortening the words. Short of it the memory can always be made to fit. An agent
 * whose memory is off has nothing held back and goes while the turn fits the ceiling.
 *
 * Otherwise the turn goes as it stands below the threshold, and at it the memory is compressed to the target.
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
