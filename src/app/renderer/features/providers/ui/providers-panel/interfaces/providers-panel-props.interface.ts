import type { Agent, ProjectModel, ProviderAnswer, ProviderState } from "../../../../../interfaces";

export interface ProvidersPanelProps {
  providers: ProviderState[];
  answers: Record<string, ProviderAnswer>;
  askingIds: string[];
  models: ProjectModel[];
  agents: Agent[];
  onAsk: (providerId: string) => void;
  onSave: (provider: ProviderState, value: string) => Promise<void>;
  /** Takes an undeclared installed model up to the catalogue. */
  onTakeUpModel: (providerId: string, title: string) => void;
}
