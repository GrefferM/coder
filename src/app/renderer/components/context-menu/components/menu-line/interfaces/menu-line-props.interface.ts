import type { ContextMenuItem } from "../../../interfaces";

/** The item to render, and where the walk stands. */
export interface MenuLineProps {
  item: ContextMenuItem;
  isWalked: boolean;
  onWalk: () => void;
}
