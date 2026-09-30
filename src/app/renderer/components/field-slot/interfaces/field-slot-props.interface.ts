import type { ReactNode } from "react";

/** A labelled slot; `wasValue` marks it draft-changed, `action` stands at the label's right edge. */
export interface FieldSlotProps {
  /** A word, or a word with its glyph. */
  label: ReactNode;
  children: ReactNode;
  htmlFor?: string;
  wasValue?: string | null;
  action?: ReactNode;
}
