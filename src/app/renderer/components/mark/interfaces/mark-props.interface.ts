import type { ReactNode } from "react";

export interface MarkProps {
  children: ReactNode;
  /** The mark is quiet unless the thing it names has a colour of its own. */
  color?: string;
  /** The taller mark of a head or a switch; the mark's own size otherwise. */
  size?: number;
  /** Pixels, or an em where the mark is spaced against its own size. */
  spacing?: number | string;
  lineHeight?: number;
  /** Upper case is the mark's own voice; a sentence, a price or a path keeps the case it is written in. */
  isUpperCase?: boolean;
  /** Where the mark stands in its row — the layout is the caller's, the type is the mark's. */
  className?: string;
}
