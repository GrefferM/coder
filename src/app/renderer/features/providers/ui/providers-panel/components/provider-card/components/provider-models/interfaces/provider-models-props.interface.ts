import type { ProjectModel, ProviderInstalledModel } from "../../../../../../../../../interfaces";

export interface ProviderModelsProps {
  models: ProviderInstalledModel[];
  catalogue: ProjectModel[];
  isAnswering: boolean;
  onAsk: () => void;
  onTakeUp: (title: string) => void;
}
