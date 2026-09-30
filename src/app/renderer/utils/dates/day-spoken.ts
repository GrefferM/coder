import { MONTHS_SPOKEN, TODAY_SPOKEN } from "./constants";

/** A day inside a sentence, «від сьогоднішнього до 24 липня»; the mono captions use `dayLabel`. */
export function daySpoken(day: Date, today: Date): string {
  const isToday =
    day.getFullYear() === today.getFullYear() &&
    day.getMonth() === today.getMonth() &&
    day.getDate() === today.getDate();

  if (isToday) {
    return TODAY_SPOKEN;
  }

  return `${day.getDate()} ${MONTHS_SPOKEN[day.getMonth()]}`;
}
