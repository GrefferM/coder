import {
  MONEY_DECIMALS,
  MONEY_PREFIX,
  MONEY_SMALLEST,
  MONEY_UNDER_PREFIX,
  MONEY_WHOLE_DECIMALS,
  MONEY_WHOLE_SMALLEST,
  UNKNOWN_NUMBER,
} from "./constants";

/** Money label: two decimals, one width everywhere; a sum under a cent is «<$0.01», so it never reads as nothing. */
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
 * The same sum with nothing rounded away — for the pointer, where a cent's parts still count. Four places
 * throughout, and under the smallest of them the same «<» the step's head uses: «$0.0000» is a lie a spent sum must
 * never tell, so a nought is written only for a true nought.
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
