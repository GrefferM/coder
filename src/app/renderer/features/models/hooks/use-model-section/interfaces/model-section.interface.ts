import type { ProjectModel, UnsavedWork } from "../../../../../interfaces";
import type { ModelFormValues } from "../../../interfaces";

/** Model catalogue page state; The marks come from `saved` against `form`. */
export interface ModelSection {
  openModelId: string | "new" | null;
  openModel: ProjectModel | null;
  form: ModelFormValues | null;
  saved: ModelFormValues | null;
  isDirty: boolean;
  unsaved: UnsavedWork | null;
  armedModelId: string | null;
  isMending: boolean;
  openForm: (modelId: string | "new" | null, isMended?: boolean) => void;
  editForm: (patch: Partial<ModelFormValues>) => void;
  revertForm: () => void;
  saveForm: () => Promise<void>;
  arm: (modelId: string | null) => void;
  confirmDelete: () => void;
  dismissDelete: () => void;
}
