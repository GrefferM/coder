import type { RunRow } from "../../../interfaces";

export interface ForgetRunConfirmProps {
  run: RunRow;
  onConfirm: () => void;
  onDismiss: () => void;
}
