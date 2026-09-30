import type { RefObject } from "react";

export interface StayAtBottom<T extends HTMLElement> {
  /** The scrolling box itself. */
  box: RefObject<T | null>;
  /** Whether the end is in view, within rounding. */
  isAtEnd: boolean;
  /** Lets the end go, so a ride to a higher place is not pulled back. */
  stopFollowing: () => void;
  /** Takes the box to its end. */
  goToEnd: () => void;
}
