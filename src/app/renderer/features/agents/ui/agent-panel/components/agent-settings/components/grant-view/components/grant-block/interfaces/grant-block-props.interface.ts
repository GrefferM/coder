import type { ReactNode } from "react";

export interface GrantBlockProps {
  /** The block's own colour — the pinned block takes the accent, the open one the quiet mark. */
  color: string;
  icon: ReactNode;
  label: string;
  /** An open parameter is not held by anything, and its box is drawn as a dashed one. */
  isDashed?: boolean;
  background?: string;
  children: ReactNode;
  /** The block's own quiet word under the box, where it has one. */
  note?: ReactNode;
}
