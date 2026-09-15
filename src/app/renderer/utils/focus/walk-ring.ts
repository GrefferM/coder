import { INTERACTION_FOCUS_RING_COLOR, INTERACTION_FOCUS_RING_PX } from "../../constants";

/** The ring drawn inside the row, so the walk's mark is never cut by a list's edge nor lost under a neighbour. */
export function walkRing(isWalked: boolean): string | undefined {
  if (!isWalked) {
    return undefined;
  }

  return `inset 0 0 0 ${INTERACTION_FOCUS_RING_PX}px ${INTERACTION_FOCUS_RING_COLOR}`;
}
