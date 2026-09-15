import type { ContextMenuItem } from "./context-menu-item.interface";
import type { ContextMenuPoint } from "./context-menu-point.interface";

/** Menu position, items, and dismiss callback. */
export interface ContextMenuProps {
  at: ContextMenuPoint;
  items: ContextMenuItem[];
  onDismiss: () => void;
}
