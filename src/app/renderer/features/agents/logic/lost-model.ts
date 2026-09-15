import type { ProjectModel } from "../../../interfaces";

/**
 * Whether the model the agent names has lost its own file. An agent being written has nothing
 * chosen yet, and nothing chosen is nothing broken.
 */
export function isModelLost(modelId: string, models: ProjectModel[]): boolean {
  return modelId !== "" && !models.some((model) => model.id === modelId);
}
