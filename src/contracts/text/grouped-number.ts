import { THOUSANDS_GROUP_LENGTH, THOUSANDS_SEPARATOR } from "./number.constant";

/** A whole number with spaces between thousands. */
export function groupedNumber(count: number): string {
  const digits = String(Math.max(0, Math.round(count)));
  const backwards = digits.split("").reverse();
  const parts: string[] = [];

  for (let at = 0; at < backwards.length; at += THOUSANDS_GROUP_LENGTH) {
    parts.push(
      backwards
        .slice(at, at + THOUSANDS_GROUP_LENGTH)
        .reverse()
        .join(""),
    );
  }

  return parts.reverse().join(THOUSANDS_SEPARATOR);
}
