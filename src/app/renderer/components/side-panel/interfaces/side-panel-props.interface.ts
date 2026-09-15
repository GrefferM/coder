import { type SidePanelItem } from "./side-panel-item.interface";
import { type SidePanelSide } from "./side-panel-side.type";

/** `SidePanel` inputs; the open section and collapsed state are controlled from outside. */
export interface SidePanelProps {
  items: SidePanelItem[];
  side: SidePanelSide;
  activeId: string;
  onActiveIdChange: (activeId: string) => void;
  widthPx: number;
  isCollapsed: boolean;
  onCollapsedChange: (isCollapsed: boolean) => void;
}
