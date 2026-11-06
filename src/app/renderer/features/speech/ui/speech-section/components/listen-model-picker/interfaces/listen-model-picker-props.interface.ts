import type { ProjectModel, ProviderState } from "../../../../../../../interfaces";

export interface ListenModelPickerProps {
  /** The project's models that recognise speech. */
  models: ProjectModel[];
  providers: ProviderState[];
  /** The chosen one by id; `null` while none is, and an id no such model answers is a broken tie. */
  modelId: string | null;
  onChange: (modelId: string) => void;
  onOpenModels: () => void;
}
