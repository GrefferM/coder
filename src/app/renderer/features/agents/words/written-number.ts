import { UNKNOWN_NUMBER } from "../../../utils/numbers/constants";

/** A number as its own row writes it, and a dash where nobody wrote one. */
export function writtenNumber(value: number | null, places = 0): string {
  return value === null ? UNKNOWN_NUMBER : value.toFixed(places);
}
