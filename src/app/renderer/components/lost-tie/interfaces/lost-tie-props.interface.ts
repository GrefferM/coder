import type { ReactNode } from "react";

/**
 * The rows are the ties themselves and `note` says what is gone; an act stands only where the tie can simply be taken
 * off — where the only way out is choosing another thing, the field above is that way, and no act is offered here.
 */
export interface LostTieProps {
  /** One reason, one sentence; a group with several reasons carries its own sentences among the rows instead. */
  note?: string;
  children: ReactNode;
  removeLabel?: string;
  onRemove?: () => void;
}
