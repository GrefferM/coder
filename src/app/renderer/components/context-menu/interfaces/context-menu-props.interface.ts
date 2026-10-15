import type { ContextMenuItem } from "./context-menu-item.interface";
import type { ContextMenuPoint } from "./context-menu-point.interface";

export interface ContextMenuProps {
  at: ContextMenuPoint;
  items: ContextMenuItem[];
  onDismiss: () => void;
}
