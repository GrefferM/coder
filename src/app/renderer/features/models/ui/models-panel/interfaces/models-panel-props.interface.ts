import type { Agent, ProjectModel, ProviderAnswer, ProviderState } from "../../../../../interfaces";
import type { ModelFormValues } from "../../../interfaces";

export interface ModelsPanelProps {
  providers: ProviderState[];
  /** Local providers' answers; lets a row say the machine does not hold a model. */
  providerAnswers: Record<string, ProviderAnswer>;
  models: ProjectModel[];
  agents: Agent[];
  openModelId: string | "new" | null;
  isMending: boolean;
  form: ModelFormValues | null;
  saved: ModelFormValues | null;
  onOpenForm: (modelId: string | "new" | null) => void;
  onFormChange: (patch: Partial<ModelFormValues>) => void;
  onSaveForm: () => Promise<void>;
  onCancelForm: () => void;
  onArmedModelIdChange: (modelId: string | null) => void;
}
