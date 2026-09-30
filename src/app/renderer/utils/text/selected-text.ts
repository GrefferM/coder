/** The page's current selection, or an empty string. */
export function selectedText(): string {
  return (window.getSelection()?.toString() ?? "").trim();
}
