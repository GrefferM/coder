import type { ReactNode } from "react";

/** The rows are the ties and `note` says what is gone; an act is offered only where the tie can simply be removed. */
export interface LostTieProps {
  /** One reason, one sentence; a group with several reasons puts its own sentences among the rows. */
  note?: string;
  children: ReactNode;
  removeLabel?: string;
  onRemove?: () => void;
}
