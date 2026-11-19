import { AGENT_CHUNK_CHANNEL } from "../../contracts";
import type { AgentChunk, AgentVoice } from "../../modules/llm";
import type { AppWindows } from "./app-windows.service";

/** Sends an answer's pieces to both windows: each draws the turns it knows by their ids and passes the rest by. */
export class WindowVoice implements AgentVoice {
  constructor(private readonly windows: AppWindows) {}

  say(chunk: AgentChunk): void {
    this.windows.toMain(AGENT_CHUNK_CHANNEL, chunk);
    this.windows.toWidget(AGENT_CHUNK_CHANNEL, chunk);
  }
}
