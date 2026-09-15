import type { ReactNode } from "react";
import type { ListWalk } from "../../../hooks";

/** The walk, this row's place in it, and the radius of the row it wraps. */
export interface WalkedRowProps {
  walk: ListWalk;
  index: number;
  borderRadius: number;
  children: ReactNode;
}
