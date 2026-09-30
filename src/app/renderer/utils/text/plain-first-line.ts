/**
 * The words before any markup, whitespace squeezed to single spaces, as one plain line.
 *
 * If markup starts at the first character, the whole text is taken plainly instead.
 */
export function plainFirstLine(said: string, markup: RegExp): string {
  const beforeMarkup = plainly(said.split(markup)[0] ?? "");

  return beforeMarkup === "" ? plainly(said) : beforeMarkup;
}

function plainly(said: string): string {
  return said.replace(/\s+/g, " ").trim();
}
