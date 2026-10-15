export interface NestedActionsProps {
  cancelLabel: string;
  confirmLabel: string;
  isConfirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
