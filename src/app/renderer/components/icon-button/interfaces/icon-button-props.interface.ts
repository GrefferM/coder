import type { ReactNode } from "react";
import type { IconTone } from "./icon-tone.interface";

export interface IconButtonProps {
  /** The button's accessible name; the glyph says nothing itself. */
  label: string;
  onPress: () => void;
  children: ReactNode;
  /** Second level at rest and first level lit, unless the glyph has colours of its own. */
  tone?: IconTone;
  isDisabled?: boolean;
}
