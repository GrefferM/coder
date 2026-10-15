import type { ReactNode } from "react";
import type { ListWalk } from "../../../hooks";

export interface WalkedRowProps {
  walk: ListWalk;
  index: number;
  borderRadius: number;
  children: ReactNode;
}
