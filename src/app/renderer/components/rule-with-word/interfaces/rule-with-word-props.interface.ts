import type { ReactNode } from "react";

export interface RuleWithWordProps {
  /** The word the rule carries: a day, «НОВИЙ ЗАПИТ», what a break came to. */
  children: ReactNode;
  /** The word is quiet unless what it announces has a tone of its own. */
  color?: string;
  className?: string;
}
