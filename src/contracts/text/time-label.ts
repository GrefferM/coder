import { TIME_PART_LENGTH } from "./time-part-length.constant";

/** HH:MM in local machine time, both parts two digits. */
export function timeLabel(moment: Date): string {
  const hours = String(moment.getHours()).padStart(TIME_PART_LENGTH, "0");
  const minutes = String(moment.getMinutes()).padStart(TIME_PART_LENGTH, "0");

  return `${hours}:${minutes}`;
}
