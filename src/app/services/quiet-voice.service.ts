import type { AgentChunk } from "../../contracts";
import type { AgentVoice } from "../../modules/llm";
import type { ProjectVoice } from "../../modules/projects";
import type { WalkVoice } from "../../modules/walks";

/** The voice of a backend with no window to speak to: nothing is said. */
export class QuietVoice implements ProjectVoice, AgentVoice, WalkVoice {
  changed(): void {
    // Neither a changed project file nor the walks' snapshot has anyone to reach.
  }

  say(_chunk: AgentChunk): void {
    // The answer is read whole from the walks' snapshot once the walk is over.
  }

  written(): void {
    // The record's writes are counted only for a screen that follows them.
  }

  heard(): void {
    // Whether a provider answers is a dot on a screen.
  }
}
