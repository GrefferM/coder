import { keepsMemory } from "../../../../../contracts";
import type { AgentDraft } from "../interfaces";

/** The two numbers of a kept memory: where it is compressed and what it is written down to. */
const MEMORY_NUMBERS = ["compressAt", "compressTo"] as const;

const RUN_NUMBERS = ["maxCalls", "temperature"] as const;

/** The agent's own numbers, in the order its tab shows them: the memory's two come first, then the run's. */
const MENDED_NUMBERS = [...MEMORY_NUMBERS, ...RUN_NUMBERS] as const;

/** A number the tab can open on. */
export type MendedNumber = (typeof MENDED_NUMBERS)[number];

export type MemoryNumber = (typeof MEMORY_NUMBERS)[number];

export type RunNumber = (typeof RUN_NUMBERS)[number];

/** The number if it is one of the memory's two, else nothing: the row of the memory's numbers a mended card points at. */
export function memoryNumberOf(number: MendedNumber | null): MemoryNumber | null {
  return MEMORY_NUMBERS.find((one) => one === number) ?? null;
}

/** The number if it is one of the run's two, else nothing. */
export function runNumberOf(number: MendedNumber | null): RunNumber | null {
  return RUN_NUMBERS.find((one) => one === number) ?? null;
}

/**
 * The first unwritten number, in the card's order: the stepper the tab opens on. The compression's two are on the tab
 * only where the memory is kept.
 */
export function mendedNumber(draft: AgentDraft): MendedNumber | null {
  return (
    MENDED_NUMBERS.find(
      (number) => draft[number] === null && (keepsMemory(draft.memory) || memoryNumberOf(number) === null),
    ) ?? null
  );
}
