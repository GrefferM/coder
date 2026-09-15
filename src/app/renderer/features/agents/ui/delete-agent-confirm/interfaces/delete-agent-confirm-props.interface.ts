export interface DeleteAgentConfirmProps {
  /** The question names the thing it is about. */
  name: string;
  neighbourNames: string[];
  onConfirm: () => void;
  onDismiss: () => void;
}
