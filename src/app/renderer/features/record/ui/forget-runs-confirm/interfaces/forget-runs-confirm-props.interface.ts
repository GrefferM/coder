import type { RunRow } from "../../../interfaces";

export interface ForgetRunsConfirmProps {
  /** The runs the list shows; the question names their count and days. */
  runs: RunRow[];
  /** The one agent whose runs these are, where the list shows an agent's runs alone; the note then says so. */
  agentName?: string;
  onConfirm: () => void;
  onDismiss: () => void;
}
