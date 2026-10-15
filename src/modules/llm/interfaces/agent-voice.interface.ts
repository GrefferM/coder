import type { AgentChunk } from "../../../contracts/llm";

export interface AgentVoice {
  say(chunk: AgentChunk): void;
}
