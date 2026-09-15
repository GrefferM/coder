import type { ProjectCommand } from "../../../../../../../interfaces";

export interface CommandRowProps {
  command: ProjectCommand;
  isOpen: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
