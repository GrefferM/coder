import type { AgentDraft } from "../interfaces";

/** The agent's own numbers, in the order its tab asks for them. */
const MENDED_NUMBERS = ["maxCalls", "temperature"] as const;

/**
 * Which stepper the tab opens on when a card sent the person here — the first number nobody wrote,
 * counted in the same order the card names it.
 */
export function mendedNumber(draft: AgentDraft): (typeof MENDED_NUMBERS)[number] | null {
  return MENDED_NUMBERS.find((number) => draft[number] === null) ?? null;
}
