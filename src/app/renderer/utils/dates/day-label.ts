import { MONTH_ABBREVIATIONS, TODAY_LABEL } from "./constants";

/** A day label: today is a word of its own, any other day is «day month». */
export function dayLabel(day: Date, today: Date): string {
  const isToday =
    day.getFullYear() === today.getFullYear() &&
    day.getMonth() === today.getMonth() &&
    day.getDate() === today.getDate();

  if (isToday) {
    return TODAY_LABEL;
  }

  return `${day.getDate()} ${MONTH_ABBREVIATIONS[day.getMonth()]}`;
}
