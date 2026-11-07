export interface DeleteAgentConfirmProps {
  name: string;
  neighbourNames: string[];
  /** The agent's schedules, left with no agent. */
  scheduleCount: number;
  onConfirm: () => void;
  onDismiss: () => void;
}
