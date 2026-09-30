import type { ReactNode, RefObject } from "react";

export interface HintStanding<Held extends HTMLElement> {
  /** Goes on the element the hint is about: the window stands beside it, and the reading kind measures it. */
  ref: RefObject<Held | null>;
  /** Render anywhere in the tree; the window goes to the body and stands where the ref does. */
  hint: ReactNode;
}
