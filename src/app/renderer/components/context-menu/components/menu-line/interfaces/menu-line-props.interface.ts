import type { ContextMenuItem } from "../../../interfaces";

export interface MenuLineProps {
  item: ContextMenuItem;
  isWalked: boolean;
  onWalk: () => void;
}
