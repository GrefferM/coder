import { BrowserWindow } from "electron";
import { AGENT_CHUNK_CHANNEL } from "../../contracts";
import type { AgentChunk, AgentVoice } from "../../modules/llm";

/** Sends an answer's pieces to the one window, looked up at send time; dropped when there is no window. */
export class WindowVoice implements AgentVoice {
  say(chunk: AgentChunk): void {
    const [window] = BrowserWindow.getAllWindows();

    window?.webContents.send(AGENT_CHUNK_CHANNEL, chunk);
  }
}
