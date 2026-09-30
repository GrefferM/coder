import {
  MONEY_DECIMALS,
  MONEY_PREFIX,
  MONEY_SMALLEST,
  MONEY_UNDER_PREFIX,
  MONEY_WHOLE_DECIMALS,
  MONEY_WHOLE_SMALLEST,
  UNKNOWN_NUMBER,
} from "./constants";

/** Two decimals, one width everywhere; a sum under a cent is «<$0.01», never zero. */
export function moneyLabel(money: number | null): string {
  if (money === null) {
    return UNKNOWN_NUMBER;
  }

  if (money > 0 && money < MONEY_SMALLEST) {
    return `${MONEY_UNDER_PREFIX}${MONEY_PREFIX}${MONEY_SMALLEST.toFixed(MONEY_DECIMALS)}`;
  }

  return `${MONEY_PREFIX}${money.toFixed(MONEY_DECIMALS)}`;
}

/**
 * The sum with four decimals, for the pointer; under the smallest it gives «<», so «$0.0000» is written only for a true
 * zero.
 */
export function wholeMoneyLabel(money: number | null): string {
  if (money === null) {
    return UNKNOWN_NUMBER;
  }

  if (money > 0 && money < MONEY_WHOLE_SMALLEST) {
    return `${MONEY_UNDER_PREFIX}${MONEY_PREFIX}${MONEY_WHOLE_SMALLEST.toFixed(MONEY_WHOLE_DECIMALS)}`;
  }

  return `${MONEY_PREFIX}${money.toFixed(MONEY_WHOLE_DECIMALS)}`;
}
