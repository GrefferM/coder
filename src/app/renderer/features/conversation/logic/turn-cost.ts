import { TOKENS_PER_PRICE_UNIT } from "../../../utils/numbers/constants";
import type { ChatCost } from "../interfaces";

/** A turn's cost: its tokens, and the money at the answering model's prices where it carried them. */
export function turnCost(
  inputTokens: number,
  outputTokens: number,
  prices: { inputPrice: number | null; outputPrice: number | null },
): ChatCost | null {
  const isCounted =
    Number.isFinite(inputTokens) && Number.isFinite(outputTokens) && (inputTokens !== 0 || outputTokens !== 0);

  if (!isCounted) {
    return null;
  }

  return {
    inputTokens,
    outputTokens,
    // A price nobody wrote is not a zero price, so the turn is counted and its money is not named.
    money: moneyOf(inputTokens, outputTokens, prices),
  };
}

/** What the turn came to at those prices, per million tokens; nothing where either price was never written. */
function moneyOf(
  inputTokens: number,
  outputTokens: number,
  prices: { inputPrice: number | null; outputPrice: number | null },
): number | null {
  if (prices.inputPrice === null || prices.outputPrice === null) {
    return null;
  }

  const money =
    (inputTokens * prices.inputPrice) / TOKENS_PER_PRICE_UNIT +
    (outputTokens * prices.outputPrice) / TOKENS_PER_PRICE_UNIT;

  return Number.isFinite(money) ? money : null;
}
