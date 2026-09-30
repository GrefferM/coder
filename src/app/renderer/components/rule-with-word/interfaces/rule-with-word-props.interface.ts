import type { ReactNode } from "react";

export interface RuleWithWordProps {
  /** The word on the rule: a day, «НОВИЙ ЗАПИТ», what a break came to. */
  children: ReactNode;
  /** Quiet unless what it announces has its own tone. */
  color?: string;
  className?: string;
}
