import type { ProjectModel } from "../project";
import type { ProviderState } from "../providers";

/** A model held by its id and the provider it names; a missing one is `null`. */
export interface ModelStands {
  model: ProjectModel | null;
  provider: ProviderState | null;
}
