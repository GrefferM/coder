import type { OpenProject } from "../../../../../interfaces";
import type { AgentSelection } from "../../../../../features/agents";
import type { CommandSection } from "../../../../../features/commands";
import type { ModelSection } from "../../../../../features/models";
import type { PromptSection } from "../../../../../features/prompts";
import type { ServerSection } from "../../../../../features/servers";
import type { ProjectFileState } from "../../../../../features/project";
import type { WayOut } from "../../../../../hooks/use-way-out/interfaces";
import type { PageParts } from "../../../hooks/use-page-parts/interfaces";

/** Everything a standing question can be about: the project, the way out, and the subjects that arm one. */
export interface MainQuestionsProps {
  project: OpenProject;
  file: ProjectFileState;
  wayOut: WayOut;
  agents: AgentSelection;
  models: ModelSection;
  commands: CommandSection;
  prompts: PromptSection;
  servers: ServerSection;
  parts: PageParts;
}
