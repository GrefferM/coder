import type { ReactNode } from "react";

export interface WordsProps {
  children: ReactNode;
  /** An empty section speaks in the second level. */
  isQuiet?: boolean;
  className?: string;
}
