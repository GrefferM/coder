import type { Agent } from "../../../../../interfaces";

export interface DeleteModelConfirmProps {
  /** The model's title, as the question and the note name it. */
  title: string;
  /** The agents on the model; none gives the short question. */
  agents: Agent[];
  onConfirm: () => void;
  onDismiss: () => void;
}
