import { SCHEDULE_EVERY_MINUTES_LEAST } from "../../../interfaces";

/** The interval typed into the form as whole minutes, or null where it is not one the file takes. */
export function writtenMinutes(typed: string): number | null {
  const minutes = Number(typed.trim());

  if (typed.trim() === "" || !Number.isInteger(minutes) || minutes < SCHEDULE_EVERY_MINUTES_LEAST) {
    return null;
  }

  return minutes;
}
