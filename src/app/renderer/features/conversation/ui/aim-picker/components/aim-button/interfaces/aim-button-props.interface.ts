import type { Agent } from "../../../../../../../interfaces";

export interface AimButtonProps {
  /** The aimed agent; `null` when none, and the press says so. */
  aimed: Agent | null;
  isOpen: boolean;
  onPress: () => void;
}
