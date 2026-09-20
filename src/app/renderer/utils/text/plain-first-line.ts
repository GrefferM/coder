/**
 * What something said, in one plain line: the words before any markup begins, whitespace squeezed to single
 * spaces. A sentence printed over five lines is five lines of a row and says no more than one; and an answer
 * that is a web page from its first character hands over a screenful of tags that buries what went wrong.
 *
 * Markup from the very first character would leave nothing said at all, so there the whole of it is taken
 * plainly instead — better long than empty.
 */
export function plainFirstLine(said: string, markup: RegExp): string {
  const beforeMarkup = plainly(said.split(markup)[0] ?? "");

  return beforeMarkup === "" ? plainly(said) : beforeMarkup;
}

function plainly(said: string): string {
  return said.replace(/\s+/g, " ").trim();
}
