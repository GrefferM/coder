import type { ReactNode } from "react";
import type { ActionButtonVariant } from "../../action-button/interfaces";

/** Dialog content and answers; `yesLabel: null` renders no confirming button. */
export interface ConfirmDialogProps {
  question: string;
  children?: ReactNode;
  tone?: "danger" | "calm";
  /** Whether the backdrop darkens. */
  hasScrim?: boolean;
  noLabel?: string;
  yesLabel?: string | null;
  /** Look of the confirming button, when it is not the app's own act. */
  yesVariant?: ActionButtonVariant;
  stayLabel?: string;
  onConfirm: () => void;
  onDecline?: () => void;
  onDismiss: () => void;
}
