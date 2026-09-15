import { useCallback } from "react";
import { deletedModelLabel } from "../../words";
import { WRITE_MODEL_LABEL } from "../../../project";
import type { OpenProject, ProjectModel } from "../../../../interfaces";
import type { ProjectWrite } from "../../../project";
import type { ModelWrites } from "./interfaces";

/** Every write the model catalogue makes to the project's file, over the project's one writer. */
export function useModelWrites(project: OpenProject, write: ProjectWrite): ModelWrites {
  const { save, defer } = write;

  /** Writes a model — updated in place, or created. */
  const saveModel = useCallback(
    async (modelId: string | null, values: Omit<ProjectModel, "id">) => {
      const existing = project.config.models.find((model) => model.id === modelId);

      await save(
        {
          ...project.config,
          models: existing
            ? project.config.models.map((model) =>
                model.id === existing.id
                  ? {
                      ...model,
                      ...values,
                    }
                  : model,
              )
            : [
                ...project.config.models,
                {
                  id: crypto.randomUUID(),
                  ...values,
                },
              ],
        },
        WRITE_MODEL_LABEL,
      );
    },
    [project.config, save],
  );

  /** The model takes every agent on it, and their links with them. */
  const deleteModel = useCallback(
    async (modelId: string) => {
      const previous = project.config;
      const leavingAgentIds = new Set(
        previous.agents.filter((agent) => agent.modelId === modelId).map((agent) => agent.id),
      );

      await defer(
        {
          ...previous,
          models: previous.models.filter((model) => model.id !== modelId),
          agents: previous.agents.filter((agent) => !leavingAgentIds.has(agent.id)),
          links: previous.links.filter((link) => !leavingAgentIds.has(link.from) && !leavingAgentIds.has(link.to)),
        },
        "model",
        previous.models.find((model) => model.id === modelId)?.title ?? "",
        deletedModelLabel(
          leavingAgentIds.size,
          previous.links.filter((link) => leavingAgentIds.has(link.from) || leavingAgentIds.has(link.to)).length,
        ),
        null,
      );
    },
    [defer, project.config],
  );

  return {
    saveModel,
    deleteModel,
  };
}
