import { INTERACTION_FOCUS_RING_COLOR, INTERACTION_FOCUS_RING_PX } from "../../constants";

/** A ring drawn inside the row, so the focus mark is not clipped by the list edge or hidden by a neighbour. */
export function walkRing(isWalked: boolean): string | undefined {
  if (!isWalked) {
    return undefined;
  }

  return `inset 0 0 0 ${INTERACTION_FOCUS_RING_PX}px ${INTERACTION_FOCUS_RING_COLOR}`;
}
