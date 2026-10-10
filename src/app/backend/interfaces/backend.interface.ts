import type { LlmController } from "../../../modules/llm";
import type { McpController } from "../../../modules/mcp";
import type { DeletionController, ProjectController, ProjectWatch } from "../../../modules/projects";
import type { ProviderController } from "../../../modules/providers";
import type { RunController, RunKeeper } from "../../../modules/runs";
import type { ProjectCatalog, WalkController, WalkHub } from "../../../modules/walks";

/** Everything the backend is made of, wired once: the doors a window knocks on, and what a command line reaches. */
export interface Backend {
  projectController: ProjectController;
  deletionController: DeletionController;
  providerController: ProviderController;
  llmController: LlmController;
  mcpController: McpController;
  runController: RunController;
  walkController: WalkController;
  /** Asked to look again whenever the window comes to the front. */
  watch: ProjectWatch;
  /** Finds a project by the name or folder a command line was given. */
  finder: ProjectCatalog;
  /** The conversation of the open project. */
  hub: WalkHub;
  /** Housekeeping of the runs; only the app that owns the database does it, never a command line beside it. */
  keeper: RunKeeper;
  /** Stops the MCP servers this backend started. */
  stopServers(): Promise<void>;
}
