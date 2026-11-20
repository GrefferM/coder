import type { ReactNode } from "react";

export interface TextCardProps {
  text: string;
  color: string;
  /** What stands on the card under its words: the recordings a question was said with. */
  children?: ReactNode;
}
