import type { ReactNode } from "react";

export interface MarkProps {
  children: ReactNode;
  /** Quiet unless the thing it names has its own colour. */
  color?: string;
  /** The taller mark of a head or a switch; otherwise the mark's own size. */
  size?: number;
  /** Pixels, or an em where the spacing scales with the mark. */
  spacing?: number | string;
  lineHeight?: number;
  /** Upper case by default; a sentence, price or path keeps its written case. */
  isUpperCase?: boolean;
  /** Placement in the caller's row. */
  className?: string;
}
