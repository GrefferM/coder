import type { WalkedKey } from "./walked-key.interface";

export interface ListWalk {
  /** Which row the keyboard stands on; rows draw it the way the pointer draws itself. */
  walked: number;
  /** The pointer moving over a row takes the walk with it, so the two never disagree. */
  walkTo: (index: number) => void;
  onKeyDown: (event: WalkedKey) => void;
  /** Put on the walked row: the list scrolls to it, so the arrows carry the sight with them. */
  walkedRow: (node: HTMLElement | null) => void;
}
