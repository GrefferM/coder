import type { ReactNode } from "react";

export interface ChipProps {
  children: ReactNode;
  /** A type is quiet, a pinned argument takes the accent, a lost one the fall's tone. */
  color: string;
  background: string;
  /** Space between the two words of one chip, a name and its value. */
  gap?: number;
  className?: string;
}
