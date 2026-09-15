import type { ProjectCommand } from "../../../../../interfaces";
import type { CommandFormValues } from "../../../interfaces";

export interface CommandsPanelProps {
  commands: ProjectCommand[];
  openCommandId: string | "new" | null;
  form: CommandFormValues | null;
  onOpenForm: (commandId: string | "new" | null) => void;
  onFormChange: (patch: Partial<CommandFormValues>) => void;
  onSaveForm: () => Promise<void>;
  onCancelForm: () => void;
  onArmedCommandIdChange: (commandId: string | null) => void;
}
