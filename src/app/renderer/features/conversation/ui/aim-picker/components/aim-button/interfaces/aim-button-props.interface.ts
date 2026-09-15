import type { Agent } from "../../../../../../../interfaces";

export interface AimButtonProps {
  /** Whom the chat is aimed at — null while nobody is, and then the press says so. */
  aimed: Agent | null;
  isOpen: boolean;
  onPress: () => void;
}
