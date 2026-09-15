import { useCallback } from "react";
import { deletedPromptLabel } from "../../words";
import { WRITE_PROMPT_LABEL } from "../../../project";
import type { OpenProject } from "../../../../interfaces";
import type { ProjectWrite } from "../../../project";
import type { PromptWrites } from "./interfaces";

/** Every write the prompt library makes to the project's file, over the project's one writer. */
export function usePromptWrites(project: OpenProject, write: ProjectWrite): PromptWrites {
  const { save, defer } = write;

  /** Writes a prompt — updated in place, or created — and returns its id. */
  const savePrompt = useCallback(
    async (promptId: string | null, name: string, text: string): Promise<string> => {
      const existing = project.config.prompts.find((prompt) => prompt.id === promptId);
      const savedId = existing?.id ?? crypto.randomUUID();

      await save(
        {
          ...project.config,
          prompts: existing
            ? project.config.prompts.map((prompt) =>
                prompt.id === existing.id
                  ? {
                      ...prompt,
                      name,
                      text,
                    }
                  : prompt,
              )
            : [
                ...project.config.prompts,
                {
                  id: savedId,
                  name,
                  // The backend names the file the first time it writes one.
                  file: "",
                  text,
                },
              ],
        },
        WRITE_PROMPT_LABEL,
      );

      return savedId;
    },
    [project.config, save],
  );

  /** Takes the prompt and unassigns it from its agents. */
  const deletePrompt = useCallback(
    async (promptId: string) => {
      const previous = project.config;

      await defer(
        {
          ...previous,
          prompts: previous.prompts.filter((prompt) => prompt.id !== promptId),
          agents: previous.agents.map((agent) =>
            agent.promptId === promptId
              ? {
                  ...agent,
                  promptId: null,
                }
              : agent,
          ),
        },
        "prompt",
        previous.prompts.find((prompt) => prompt.id === promptId)?.name ?? "",
        deletedPromptLabel(previous.agents.filter((agent) => agent.promptId === promptId).length),
        null,
      );
    },
    [defer, project.config],
  );

  return {
    savePrompt,
    deletePrompt,
  };
}
