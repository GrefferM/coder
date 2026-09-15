import type { RefObject } from "react";

export interface StayAtBottom<T extends HTMLElement> {
  /** The scrolling box itself. */
  box: RefObject<T | null>;
  /** Whether the end of it is in view — a pixel or two of rounding still counts as being there. */
  isAtEnd: boolean;
  /** Lets the end go, so a ride to a place higher up is not pulled back to it. */
  stopFollowing: () => void;
  /** Takes the box to its end. */
  goToEnd: () => void;
}
