/** Cancel/confirm labels and handlers; `isConfirmDisabled` gates the confirm button. */
export interface NestedActionsProps {
  cancelLabel: string;
  confirmLabel: string;
  isConfirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
