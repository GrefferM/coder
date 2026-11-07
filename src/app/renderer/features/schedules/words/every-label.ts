import { spanLabel } from "./span-label";
import { SCHEDULE_EVERY_WORD } from "../constants";

/** «КОЖНІ 15 ХВ». */
export function everyLabel(minutes: number): string {
  return `${SCHEDULE_EVERY_WORD} ${spanLabel(minutes)}`;
}
