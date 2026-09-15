import {
  INTERACTION_DANGER_FOCUS_RING_COLOR,
  INTERACTION_FOCUS_RING_COLOR,
  INTERACTION_FOCUS_RING_PX,
} from "../../constants";

/** Focus ring as an outer `box-shadow`, so it shifts no layout. */
export function focusRing(isFocused: boolean, isDanger = false): string | undefined {
  if (!isFocused) {
    return undefined;
  }

  const color = isDanger ? INTERACTION_DANGER_FOCUS_RING_COLOR : INTERACTION_FOCUS_RING_COLOR;

  return `0 0 0 ${INTERACTION_FOCUS_RING_PX}px ${color}`;
}
