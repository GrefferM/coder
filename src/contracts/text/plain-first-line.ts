/** The words before any markup as one plain line, whitespace squeezed; the whole text where markup comes first. */
export function plainFirstLine(said: string, markup: RegExp): string {
  const beforeMarkup = plainly(said.split(markup)[0] ?? "");

  return beforeMarkup === "" ? plainly(said) : beforeMarkup;
}

function plainly(said: string): string {
  return said.replace(/\s+/g, " ").trim();
}
