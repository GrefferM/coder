import type { ReactNode, RefObject } from "react";

export interface HintStanding<Held extends HTMLElement> {
  /** Put this on the thing the hint is about: the window stands beside it, and the reading kind measures it. */
  ref: RefObject<Held | null>;
  /** Render it anywhere in the tree — the window itself goes to the body and stands where the ref does. */
  hint: ReactNode;
}
