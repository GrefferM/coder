/** A fenced block of code, closed or still open at the end of the text. */
export const CODE_BLOCK = /```[\s\S]*?(```|$)/g;

/** What stands in a block's place when it is read: a sentence's end, so the voice pauses. */
export const CODE_PAUSE = ". ";

/** The rest of a word from where the voice reached it. */
export const WORD_END = /^\S+/;

/** Where a pause that stands for code comes from: no character of the card. */
export const PAUSE_ORIGIN = -1;
