import type { ReactNode } from "react";
import type { ActionButtonVariant } from "../../action-button/interfaces";

/** Dialog content and answers; `yesLabel: null` renders no confirming button. */
export interface ConfirmDialogProps {
  question: string;
  children?: ReactNode;
  tone?: "danger" | "calm";
  /** Whether what stands behind the box darkens — it does not when nothing behind it is going. */
  hasScrim?: boolean;
  noLabel?: string;
  yesLabel?: string | null;
  /** The confirming answer's look, when the calm box's answer is not the app's own act. */
  yesVariant?: ActionButtonVariant;
  stayLabel?: string;
  onConfirm: () => void;
  onDecline?: () => void;
  onDismiss: () => void;
}
