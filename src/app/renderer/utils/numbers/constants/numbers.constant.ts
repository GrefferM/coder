/** Whole counts: thousands separated by a space, unit after; the head uses the short form. */
export const THOUSANDS_GROUP_LENGTH = 3;
export const THOUSANDS_SEPARATOR = " ";
export const TOKENS_SUFFIX = " ТКН";
export const TOKENS_WAY_SEPARATOR = "/";

/** Short count for a head: in thousands, one decimal at most, no trailing zero. */
export const COUNT_THOUSAND = 1000;
export const COUNT_MILLION = 1000000;
export const COUNT_THOUSAND_MARK = "К";
export const COUNT_MILLION_MARK = "М";
export const COUNT_DECIMALS = 1;

/** Money: two decimals, and «<» the smallest for a sum too small to reach one. */
export const MONEY_PREFIX = "$";
export const MONEY_DECIMALS = 2;
export const MONEY_UNDER_PREFIX = "<";
export const MONEY_SMALLEST = 0.01;

/** Full-precision sum, for the pointer only. */
export const MONEY_WHOLE_DECIMALS = 4;
/** The smallest sum the pointer prints; under it «<» is shown, never «$0.0000». */
export const MONEY_WHOLE_SMALLEST = 0.0001;

/** Stands in for a number the record lacks; the place and unit stay. */
export const UNKNOWN_NUMBER = "—";

/** Prices are per million tokens, as providers quote them. */
export const TOKENS_PER_PRICE_UNIT = 1000000;
