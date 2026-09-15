import type { ReactNode } from "react";

/** A labelled slot; `wasValue` marks it draft-changed, `action` stands at the label's right edge. */
export interface FieldSlotProps {
  /** A word, or a word with its glyph: the tools section wears the glyph of the порода it holds. */
  label: ReactNode;
  children: ReactNode;
  htmlFor?: string;
  wasValue?: string | null;
  action?: ReactNode;
}
