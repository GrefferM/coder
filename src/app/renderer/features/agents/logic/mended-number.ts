import type { AgentDraft } from "../interfaces";

/** The agent's own numbers, in the order its tab asks for them. */
const MENDED_NUMBERS = ["maxCalls", "temperature"] as const;

/** The first unwritten number, in the card's order: the stepper the tab opens on. */
export function mendedNumber(draft: AgentDraft): (typeof MENDED_NUMBERS)[number] | null {
  return MENDED_NUMBERS.find((number) => draft[number] === null) ?? null;
}
