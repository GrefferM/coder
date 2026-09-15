/**
 * The number lives inside the search field, because the field is what it is about — «142» while nothing
 * is typed, «40 МІСЦЬ · 3 ЗАПУСКИ» once something is. Two numbers, because one would not say it: the places tell how
 * much reading there is, the runs tell how far apart it lies.
 */
export const FOUND_PLACE_FORMS: [string, string, string] = ["МІСЦЕ", "МІСЦЯ", "МІСЦЬ"];
export const FOUND_RUN_FORMS: [string, string, string] = ["ЗАПУСК", "ЗАПУСКИ", "ЗАПУСКІВ"];
export const FOUND_COUNT_SEPARATOR = " · ";
/** At the ceiling the second number is not a count but the word for why counting stopped. */
export const FOUND_CEILING_WORD = "СТЕЛЯ";
/**
 * The ceiling stands on places, so the sentence says what to do about places — add a letter. The number in it
 * is written as a word, and the constant below holds that word's value so a spec can hold the two together.
 */
export const FOUND_CEILING_NOTE = "Далі не лічилось: місць більше за триста. Додайте літеру — і список стане коротшим.";

/** The number the note spells out in words. Nothing reads it but the spec that keeps the sentence honest. */
export const FOUND_CEILING_SPOKEN = 300;
