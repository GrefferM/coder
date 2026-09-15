import type { ProjectCommand, UnsavedWork } from "../../../../../interfaces";
import type { CommandFormValues } from "../../../interfaces";

/** Command catalogue page state: the open row, the form's draft, and the deletion ask over the canvas. */
export interface CommandSection {
  openCommandId: string | "new" | null;
  openCommand: ProjectCommand | null;
  form: CommandFormValues | null;
  isDirty: boolean;
  unsaved: UnsavedWork | null;
  armedCommand: ProjectCommand | null;
  openForm: (commandId: string | "new" | null) => void;
  editForm: (patch: Partial<CommandFormValues>) => void;
  saveForm: () => Promise<void>;
  arm: (commandId: string | null) => void;
  confirmDelete: () => void;
  dismissDelete: () => void;
}
