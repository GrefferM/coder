import type { Agent } from "../../../../../interfaces";

export interface DeleteModelConfirmProps {
  /** The model's title, as the question and the note name it. */
  title: string;
  /** The agents standing on it; none of them is the short question, without the burden. */
  agents: Agent[];
  onConfirm: () => void;
  onDismiss: () => void;
}
