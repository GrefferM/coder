const ESCAPE = String.fromCharCode(27);
/** Built so no control character stands in the source. */
const COLORS = new RegExp(`${ESCAPE}\\[[0-9;]*[A-Za-z]|${ESCAPE}[()#][0-9A-Za-z]|${ESCAPE}[A-Za-z]`, "g");

/**
 * Strips terminal colours from a server's answer: every CSI sequence and the lone escapes around it. Words, line breaks
 * and punctuation are untouched.
 */
export function withoutColors(said: string): string {
  return said.replace(COLORS, "");
}
