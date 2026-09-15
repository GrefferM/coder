import type { ReactNode } from "react";

export interface ContextMenuItem {
  label: string;
  icon: ReactNode;
  shortcut?: string;
  onSelect: () => void;
  isDanger?: boolean;
  isDisabled?: boolean;
  hasSeparatorAbove?: boolean;
}
