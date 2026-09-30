/**
 * The count shown inside the search field: «142» while empty, «40 МІСЦЬ · 3 ЗАПУСКИ» once typed. Places say how much to
 * read, runs how spread out it is.
 */
export const FOUND_PLACE_FORMS: [string, string, string] = ["МІСЦЕ", "МІСЦЯ", "МІСЦЬ"];
export const FOUND_RUN_FORMS: [string, string, string] = ["ЗАПУСК", "ЗАПУСКИ", "ЗАПУСКІВ"];
export const FOUND_COUNT_SEPARATOR = " · ";
/** At the ceiling the second number is the word for why counting stopped. */
export const FOUND_CEILING_WORD = "СТЕЛЯ";
/**
 * The ceiling note: counting stopped at the ceiling of places; add a letter. Its number is in words, with its value in
 * `FOUND_CEILING_SPOKEN`.
 */
export const FOUND_CEILING_NOTE = "Далі не лічилось: місць більше за триста. Додайте літеру — і список стане коротшим.";

/** The number the note spells out in words; read only by the spec. */
export const FOUND_CEILING_SPOKEN = 300;
