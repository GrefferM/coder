import type { ReactNode } from "react";

/** Quiet line content. */
export interface QuietLineProps {
  children: ReactNode;
  /** The rule stands quiet until it is broken, and then the same words stand in the trouble colour. */
  isTroubled?: boolean;
}
