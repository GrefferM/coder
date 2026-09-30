import type { OpenProject } from "../../../interfaces";
import type { AgentClipboard, AgentDrafting, AgentSelection } from "../../../features/agents";
import type { CommandSection } from "../../../features/commands";
import type { ServerSection } from "../../../features/servers";
import type { ModelSection } from "../../../features/models";
import type { PromptSection } from "../../../features/prompts";
import type { ProjectActions } from "../hooks/use-project-actions/interfaces";
import type { WayOut } from "../../../hooks/use-way-out/interfaces";

/** The subjects the open project's screen works through, gathered once by the page and passed whole to its hooks. */
export interface PageSubjects {
  project: OpenProject;
  agents: AgentSelection;
  /** The sphere in hand, and the mark on the copy just put down. */
  clipboard: AgentClipboard;
  drafted: AgentDrafting;
  models: ModelSection;
  commands: CommandSection;
  servers: ServerSection;
  prompts: PromptSection;
  /** Every write to the project file, one per subject. */
  actions: ProjectActions;
  /** The question an unsaved draft asks before leaving. */
  wayOut: WayOut;
}
