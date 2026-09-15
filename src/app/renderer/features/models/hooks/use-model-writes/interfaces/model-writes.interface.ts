import type { ProjectModel } from "../../../../../interfaces";

/** A model written in place or declared, and a model taken away with its agents. */
export interface ModelWrites {
  saveModel: (modelId: string | null, values: Omit<ProjectModel, "id">) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
}
