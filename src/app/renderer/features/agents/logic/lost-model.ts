import type { ProjectModel } from "../../../interfaces";

/** Whether the agent's model has lost its file; nothing chosen is not lost. */
export function isModelLost(modelId: string, models: ProjectModel[]): boolean {
  return modelId !== "" && !models.some((model) => model.id === modelId);
}
