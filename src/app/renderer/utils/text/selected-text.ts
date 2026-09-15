/** What the person has selected on the page right now, or an empty string when nothing is. */
export function selectedText(): string {
  return (window.getSelection()?.toString() ?? "").trim();
}
