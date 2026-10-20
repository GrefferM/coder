import {
  COMPOSER_BUDGET_SLOT,
  COMPOSER_CHARACTERS_PER_WORD,
  COMPOSER_INSTRUCTION,
  COMPOSER_MEMORY_CLOSING,
  COMPOSER_MEMORY_OPENING,
} from "./composer-words.constant";
import { codePoints } from "./code-points";

/** The words a budget in characters is told as: whole words, and never fewer than one. */
export function composerWords(budget: number): number {
  return Math.max(1, Math.floor(budget / COMPOSER_CHARACTERS_PER_WORD));
}

/** The composer's instruction with the number of words it may write for a budget in characters. */
export function composerInstruction(budget: number): string {
  return COMPOSER_INSTRUCTION.replaceAll(COMPOSER_BUDGET_SLOT, String(composerWords(budget)));
}

/** The composer's one message: the memory fenced in, then what to do with it. */
export function composerMessage(memory: string, budget: number): string {
  return `${COMPOSER_MEMORY_OPENING}${memory}${COMPOSER_MEMORY_CLOSING}${composerInstruction(budget)}`;
}

/**
 * What the composer's message holds besides the memory, in characters: the fence and the instruction. The budget is
 * told in as many digits as the ceiling has, which no budget passes.
 */
export function composerLength(ceiling: number): number {
  return (
    codePoints(COMPOSER_MEMORY_OPENING) + codePoints(COMPOSER_MEMORY_CLOSING) + codePoints(composerInstruction(ceiling))
  );
}
