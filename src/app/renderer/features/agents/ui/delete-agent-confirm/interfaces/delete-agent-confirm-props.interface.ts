export interface DeleteAgentConfirmProps {
  name: string;
  neighbourNames: string[];
  onConfirm: () => void;
  onDismiss: () => void;
}
