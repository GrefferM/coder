import type { AGENT_CHUNK_CHANNEL } from "../channels/llm.channel";
import type { PROJECT_CHANGED_CHANNEL } from "../channels/projects.channel";
import type { WALKS_CHANGED_CHANNEL, WALKS_HEARD_CHANNEL, WALKS_WRITTEN_CHANNEL } from "../channels/walks.channel";
import type { AgentChunk } from "../llm";
import type { ProviderHeard, WalkSnapshot } from "../walks";
import type { ProjectChanged } from "./payloads.interface";

/** What the main process sends unprompted on each channel; a push has no answer, so it has its own map. */
export interface PushMap {
  [AGENT_CHUNK_CHANNEL]: AgentChunk;
  [PROJECT_CHANGED_CHANNEL]: ProjectChanged;
  [WALKS_CHANGED_CHANNEL]: WalkSnapshot;
  [WALKS_WRITTEN_CHANNEL]: void;
  [WALKS_HEARD_CHANNEL]: ProviderHeard;
}

/** Every push channel; a name outside this is not one. */
export type Push = keyof PushMap;

export type Pushed<P extends Push> = PushMap[P];
