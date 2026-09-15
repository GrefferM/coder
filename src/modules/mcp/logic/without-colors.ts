/**
 * A server's answer goes to the model and into the record **as it came**, but a terminal's colours are not part
 * of what it said: a server passing escape sequences through shows «[2m … [22m» where words should stand, and the
 * model is charged for reading them.
 *
 * So the paint comes off and nothing else — every CSI sequence and the lone escapes around it. Words, line breaks
 * and punctuation are untouched: none of this was text.
 */
const ESCAPE = String.fromCharCode(27);
/** Built rather than written out, so no control character stands in the source of this file. */
const COLORS = new RegExp(`${ESCAPE}\\[[0-9;]*[A-Za-z]|${ESCAPE}[()#][0-9A-Za-z]|${ESCAPE}[A-Za-z]`, "g");

export function withoutColors(said: string): string {
  return said.replace(COLORS, "");
}
