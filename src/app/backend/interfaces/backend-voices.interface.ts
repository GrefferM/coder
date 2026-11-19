import type { AgentVoice } from "../../../modules/llm";
import type { ProjectVoice } from "../../../modules/projects";
import type { WalkVoice } from "../../../modules/walks";

/** Where the backend speaks: to a window, or to no one where nothing is on screen. */
export interface BackendVoices {
  project: ProjectVoice;
  agent: AgentVoice;
  walk: WalkVoice;
}
