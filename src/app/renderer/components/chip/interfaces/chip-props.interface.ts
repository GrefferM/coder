import type { ReactNode } from "react";

export interface ChipProps {
  children: ReactNode;
  /** What the value is: a type is quiet, a pinned argument takes the accent, a lost one the fall's tone. */
  color: string;
  background: string;
  /** The air between two words in one chip — a name and its value. */
  gap?: number;
  className?: string;
}
