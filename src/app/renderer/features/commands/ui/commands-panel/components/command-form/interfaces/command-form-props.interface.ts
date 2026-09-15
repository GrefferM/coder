import type { CommandFormValues } from "../../../../../interfaces";

export interface CommandFormProps {
  values: CommandFormValues;
  isNew: boolean;
  takenNames: string[];
  onChange: (patch: Partial<CommandFormValues>) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
}
