import type { ReactNode } from "react";
import type { IconTone } from "../../icon-button";

export interface TextButtonProps {
  /** The word, and the glyph beside it where the act has one. */
  children: ReactNode;
  onPress: () => void;
  /** The word's shade at rest and under pointer or keyboard. */
  tone: IconTone;
  /** The air between a glyph and the word beside it. */
  gap?: number;
  /** Placement in the caller's row. */
  className?: string;
}
