import type { RunRow } from "../../../interfaces";

export interface ForgetRunsConfirmProps {
  /** The runs the list shows; the question names their count and days. */
  runs: RunRow[];
  onConfirm: () => void;
  onDismiss: () => void;
}
