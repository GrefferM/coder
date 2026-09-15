import type { RunRow } from "../../../interfaces";

export interface ForgetRunsConfirmProps {
  /** Exactly what the list is showing — the question names that number and its days. */
  runs: RunRow[];
  onConfirm: () => void;
  onDismiss: () => void;
}
