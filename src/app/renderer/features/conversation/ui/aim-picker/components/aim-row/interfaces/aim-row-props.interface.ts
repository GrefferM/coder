import type { Agent } from "../../../../../../../interfaces";

export interface AimRowProps {
  agent: Agent;
  /** The aimed agent: a ring around its dot. */
  isAimed: boolean;
  /** The row the keyboard is on; the pointer moves it. */
  isWalked: boolean;
  walkedRow: (node: HTMLElement | null) => void;
  onChoose: () => void;
  onWalk: () => void;
}
