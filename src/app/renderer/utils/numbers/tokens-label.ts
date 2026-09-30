import { groupedNumber } from "./grouped-number";
import { shortCount } from "./short-count";
import { TOKENS_SUFFIX, TOKENS_WAY_SEPARATOR } from "./constants";

/** Both counts in thousands, no unit; «ТКН» appears on the pointer. */
export function tokensLabel(inputTokens: number, outputTokens: number): string {
  return `${shortCount(inputTokens)}${TOKENS_WAY_SEPARATOR}${shortCount(outputTokens)}`;
}

/** Both counts in full, unit named, for the pointer. */
export function wholeTokensLabel(inputTokens: number, outputTokens: number): string {
  return `${groupedNumber(inputTokens)}${TOKENS_WAY_SEPARATOR}${groupedNumber(outputTokens)}${TOKENS_SUFFIX}`;
}
