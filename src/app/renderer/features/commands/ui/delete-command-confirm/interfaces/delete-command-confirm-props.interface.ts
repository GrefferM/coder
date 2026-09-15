import type { ProjectCommand } from "../../../../../interfaces";

export interface DeleteCommandConfirmProps {
  command: ProjectCommand;
  onConfirm: () => void;
  onDismiss: () => void;
}
