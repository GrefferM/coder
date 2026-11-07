export interface DeleteScheduleConfirmProps {
  /** The schedule's agent's name; null where the agent is gone. */
  agentName: string | null;
  onConfirm: () => void;
  onDismiss: () => void;
}
