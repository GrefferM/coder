/** The row's list: the first ancestor that can scroll and has room to. */
function listOf(node: HTMLElement): HTMLElement | null {
  for (let above = node.parentElement; above !== null; above = above.parentElement) {
    const flow = getComputedStyle(above).overflowY;

    if ((flow === "auto" || flow === "scroll") && above.scrollHeight > above.clientHeight) {
      return above;
    }
  }

  return null;
}

/** A length the browser may leave unsaid. */
function px(length: string): number {
  return Number.parseFloat(length) || 0;
}

/** Scrolls the list by exactly what the row lacks to be fully visible; not at all when it is. */
export function keepInSight(node: HTMLElement): void {
  const list = listOf(node);

  if (list === null) {
    return;
  }

  const style = getComputedStyle(list);
  const row = node.getBoundingClientRect();
  const seen = list.getBoundingClientRect();
  // The list's border and padding are kept clear, so the row and its ring come fully in.
  const top = seen.top + px(style.borderTopWidth) + px(style.paddingTop);
  const bottom = seen.bottom - px(style.borderBottomWidth) - px(style.paddingBottom);

  if (row.top < top) {
    list.scrollTop -= top - row.top;

    return;
  }

  if (row.bottom > bottom) {
    list.scrollTop += row.bottom - bottom;
  }
}
