import { groupedNumber } from "./grouped-number";
import { shortCount } from "./short-count";
import { TOKENS_SUFFIX, TOKENS_WAY_SEPARATOR } from "./constants";

/** The head says both counts in thousands and no unit — «ТКН» stands on the pointer instead. */
export function tokensLabel(inputTokens: number, outputTokens: number): string {
  return `${shortCount(inputTokens)}${TOKENS_WAY_SEPARATOR}${shortCount(outputTokens)}`;
}

/** The same two counts with nothing rounded away, unit named — for the pointer, where there is room. */
export function wholeTokensLabel(inputTokens: number, outputTokens: number): string {
  return `${groupedNumber(inputTokens)}${TOKENS_WAY_SEPARATOR}${groupedNumber(outputTokens)}${TOKENS_SUFFIX}`;
}
