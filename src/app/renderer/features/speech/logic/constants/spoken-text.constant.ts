/** A fenced block of code, closed or still open at the end of the text. */
export const CODE_BLOCK = /```[\s\S]*?(```|$)/g;

/** What stands in a block's place when it is read: a sentence's end, so the voice pauses. */
export const CODE_PAUSE = ". ";
