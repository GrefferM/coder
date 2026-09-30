import { UNKNOWN_NUMBER } from "../../../utils/numbers/constants";

/** A number as its row writes it, a dash where none was written. */
export function writtenNumber(value: number | null, places = 0): string {
  return value === null ? UNKNOWN_NUMBER : value.toFixed(places);
}
