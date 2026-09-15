import type { ReactNode } from "react";

export interface WordsProps {
  children: ReactNode;
  /** An empty section speaks in the second level — nothing happened, so nothing is stressed. */
  isQuiet?: boolean;
  className?: string;
}
