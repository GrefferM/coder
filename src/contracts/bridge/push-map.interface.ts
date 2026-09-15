import type { AGENT_CHUNK_CHANNEL } from "../channels/llm.channel";
import type { PROJECT_CHANGED_CHANNEL } from "../channels/projects.channel";
import type { AgentChunk } from "../llm";
import type { ProjectChanged } from "./payloads.interface";

/**
 * What the main process says of its own accord, and what each such channel carries. A push is not a call: nobody
 * asked for it and nothing is answered, so it has a map of its own.
 */
export interface PushMap {
  [AGENT_CHUNK_CHANNEL]: AgentChunk;
  [PROJECT_CHANGED_CHANNEL]: ProjectChanged;
}

/** Every channel the main process pushes over; a name outside this is not one. */
export type Push = keyof PushMap;

export type Pushed<P extends Push> = PushMap[P];
