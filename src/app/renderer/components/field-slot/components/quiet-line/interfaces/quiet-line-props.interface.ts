import type { ReactNode } from "react";

/** Quiet line content. */
export interface QuietLineProps {
  children: ReactNode;
  /** Shows the same words in the trouble colour. */
  isTroubled?: boolean;
}
