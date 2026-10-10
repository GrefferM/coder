export {
  THOUSANDS_GROUP_LENGTH,
  THOUSANDS_SEPARATOR,
  TOKENS_PER_PRICE_UNIT,
  UNKNOWN_NUMBER,
} from "../../../../../contracts/text";

/** Whole counts: unit after the number; the head uses the short form. */
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
