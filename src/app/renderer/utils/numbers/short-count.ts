import { COUNT_DECIMALS, COUNT_MILLION, COUNT_MILLION_MARK, COUNT_THOUSAND, COUNT_THOUSAND_MARK } from "./constants";

/** A share of a unit: one decimal at most, no trailing zero. */
function sharedCount(whole: number, unit: number): number {
  return Number((whole / unit).toFixed(COUNT_DECIMALS));
}

/** A count in thousands («0.5К», «3К», «120.4К», «1.2М») so a head keeps one width. */
export function shortCount(count: number): string {
  const whole = Math.max(0, Math.round(count));
  const thousands = sharedCount(whole, COUNT_THOUSAND);

  if (thousands < COUNT_THOUSAND) {
    return `${thousands}${COUNT_THOUSAND_MARK}`;
  }

  return `${sharedCount(whole, COUNT_MILLION)}${COUNT_MILLION_MARK}`;
}
