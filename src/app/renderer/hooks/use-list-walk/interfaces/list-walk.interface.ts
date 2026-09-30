import type { WalkedKey } from "./walked-key.interface";

export interface ListWalk {
  /** The row the keyboard stands on; rows draw it as the pointer draws itself. */
  walked: number;
  /** The pointer over a row takes the walk with it. */
  walkTo: (index: number) => void;
  onKeyDown: (event: WalkedKey) => void;
  /** Put on the walked row; the list scrolls to it. */
  walkedRow: (node: HTMLElement | null) => void;
}
