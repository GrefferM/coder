import type { ReactNode } from "react";

export interface GrantBlockProps {
  /** The block's colour: accent for pinned, quiet mark for open. */
  color: string;
  icon: ReactNode;
  label: string;
  /** Draws the box dashed, for open parameters. */
  isDashed?: boolean;
  background?: string;
  children: ReactNode;
  /** The block's own quiet word under the box, where it has one. */
  note?: ReactNode;
}
