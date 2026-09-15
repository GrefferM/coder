import { BrowserWindow } from "electron";
import { AGENT_CHUNK_CHANNEL } from "../../contracts";
import type { AgentChunk, AgentVoice } from "../../modules/llm";

/** Sends an answer's pieces to the app's one window, found at send time; with no window a piece is dropped. */
export class WindowVoice implements AgentVoice {
  say(chunk: AgentChunk): void {
    const [window] = BrowserWindow.getAllWindows();

    window?.webContents.send(AGENT_CHUNK_CHANNEL, chunk);
  }
}
