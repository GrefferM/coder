import type { AgentChunk } from "../../../contracts/llm";

/** Sink for the pieces of an answer as they arrive. */
export interface AgentVoice {
  say(chunk: AgentChunk): void;
}
