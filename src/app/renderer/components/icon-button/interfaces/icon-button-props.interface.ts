import type { ReactNode } from "react";
import type { IconTone } from "./icon-tone.interface";

export interface IconButtonProps {
  /** The button's name for a reader; the glyph says nothing by itself. */
  label: string;
  onPress: () => void;
  /** The glyph. */
  children: ReactNode;
  /** Second-level at rest and first-level lit unless the glyph stands on colours of its own. */
  tone?: IconTone;
  isDisabled?: boolean;
}
