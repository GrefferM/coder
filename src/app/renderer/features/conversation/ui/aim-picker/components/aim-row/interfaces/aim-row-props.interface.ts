import type { Agent } from "../../../../../../../interfaces";

export interface AimRowProps {
  agent: Agent;
  /** The one the chat is aimed at — a ring around its dot, and no tick anywhere. */
  isAimed: boolean;
  /** The row the keyboard stands on, which the pointer moves as it passes. */
  isWalked: boolean;
  walkedRow: (node: HTMLElement | null) => void;
  onChoose: () => void;
  onWalk: () => void;
}
