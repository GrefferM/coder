import type { AGENT_CHUNK_CHANNEL } from "../channels/llm.channel";
import type { PROJECT_CHANGED_CHANNEL } from "../channels/projects.channel";
import type { AgentChunk } from "../llm";
import type { ProjectChanged } from "./payloads.interface";

/**
 * What the main process sends unprompted and what each channel carries; a push is not a call and has no answer, so it
 * has its own map.
 */
export interface PushMap {
  [AGENT_CHUNK_CHANNEL]: AgentChunk;
  [PROJECT_CHANGED_CHANNEL]: ProjectChanged;
}

/** Every push channel; a name outside this is not one. */
export type Push = keyof PushMap;

export type Pushed<P extends Push> = PushMap[P];
