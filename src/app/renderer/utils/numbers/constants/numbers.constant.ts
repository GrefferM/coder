/** The whole counts — thousands separated by a space, unit named after; the head says them shorter. */
export const THOUSANDS_GROUP_LENGTH = 3;
export const THOUSANDS_SEPARATOR = " ";
export const TOKENS_SUFFIX = " ТКН";
export const TOKENS_WAY_SEPARATOR = "/";

/** A count short enough for a head: it is said in thousands, with one decimal at most and no trailing zero. */
export const COUNT_THOUSAND = 1000;
export const COUNT_MILLION = 1000000;
export const COUNT_THOUSAND_MARK = "К";
export const COUNT_MILLION_MARK = "М";
export const COUNT_DECIMALS = 1;

/** Money: two decimals everywhere, and «<» the smallest of them for a sum too small to reach one. */
export const MONEY_PREFIX = "$";
export const MONEY_DECIMALS = 2;
export const MONEY_UNDER_PREFIX = "<";
export const MONEY_SMALLEST = 0.01;

/** What a sum comes to when nothing is rounded away — for the pointer, never for the head. */
export const MONEY_WHOLE_DECIMALS = 4;
/** The smallest the pointer prints; under it the same «<» stands, so «$0.0000» is never written. */
export const MONEY_WHOLE_SMALLEST = 0.0001;

/** A number the record never carried — the place and the unit stay, and a dash stands in for it. */
export const UNKNOWN_NUMBER = "—";

/** Prices are per million tokens, as providers quote them. */
export const TOKENS_PER_PRICE_UNIT = 1000000;
