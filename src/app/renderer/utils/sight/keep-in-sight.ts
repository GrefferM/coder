/** The first ancestor that both may scroll and has somewhere to scroll is the list the row lives in. */
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

/** The list scrolls by exactly what the row is short of being wholly seen, and by nothing when it is. */
export function keepInSight(node: HTMLElement): void {
  const list = listOf(node);

  if (list === null) {
    return;
  }

  const style = getComputedStyle(list);
  const row = node.getBoundingClientRect();
  const seen = list.getBoundingClientRect();
  // The list keeps its own border and padding clear, so the row comes wholly in — its ring with it.
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
