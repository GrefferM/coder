import { useAgentWrites } from "../../../../features/agents";
import { useLinkWrites } from "../../../../features/links";
import { useModelWrites } from "../../../../features/models";
import { useCommandWrites } from "../../../../features/commands";
import { useServerWrites } from "../../../../features/servers";
import { usePromptWrites } from "../../../../features/prompts";
import { useSpeechWrites } from "../../../../features/speech";
import { useProjectWrite } from "../../../../features/project";
import type { Dispatch, SetStateAction } from "react";
import type { OpenProject } from "../../../../interfaces";
import type { ProjectActions } from "./interfaces";

/** Composes each subject's writes over the project's single writer. */
export function useProjectActions(
  project: OpenProject,
  setProject: Dispatch<SetStateAction<OpenProject | null>>,
): ProjectActions {
  const write = useProjectWrite(project, setProject);
  const agents = useAgentWrites(project, write);
  const links = useLinkWrites(project, write);
  const models = useModelWrites(project, write);
  const commands = useCommandWrites(project, write);
  const servers = useServerWrites(project, write);
  const prompts = usePromptWrites(project, write);
  const speech = useSpeechWrites(project, write);

  return {
    ...write,
    ...agents,
    ...links,
    ...models,
    ...commands,
    ...servers,
    ...prompts,
    ...speech,
  };
}
