import type { AgentDraft } from "../interfaces";

/** The agent's own numbers, in the order its tab shows them: the memory's two come first, then the run's. */
const MENDED_NUMBERS = ["compressAt", "compressTo", "maxCalls", "temperature"] as const;

/** A number the tab can open on. */
export type MendedNumber = (typeof MENDED_NUMBERS)[number];

/**
 * The first unwritten number, in the card's order: the stepper the tab opens on. The compression's two are on the tab
 * only where the memory is kept.
 */
export function mendedNumber(draft: AgentDraft): MendedNumber | null {
  return (
    MENDED_NUMBERS.find(
      (number) => draft[number] === null && (draft.memory !== "none" || !number.startsWith("compress")),
    ) ?? null
  );
}
