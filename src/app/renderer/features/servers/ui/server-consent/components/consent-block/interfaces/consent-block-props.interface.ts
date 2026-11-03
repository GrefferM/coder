import type { ReactNode } from "react";

export interface ConsentBlockProps {
  label: string;
  /** A quiet word at the far end of the head. */
  aside?: string;
  children: ReactNode;
}
