import type { NamedAgent, WorkingAgent } from "../../../../../interfaces";
import type { ChatMessage } from "../../../interfaces";
import type { OpenCalls } from "../../../hooks";

/** What stands in the stream: the words, everyone who said them, and what is still being said. */
export interface ChatSaid {
  messages: ChatMessage[];
  agents: NamedAgent[];
  /** Every agent with a turn out, each with what it is saying and what it ran. */
  working: WorkingAgent[];
  /**
   * Which call rows stand open. The chat is handed it rather than making it, because the catalogue can
   * open one too — the memory has to be the same one, or the two would disagree about the same call.
   */
  openCalls: OpenCalls;
  /** The turns already asked again; the act under a turn stands until it is used, and no longer. */
  saidAgain: string[];
  /** The message the search drove to — the stream rides to it and it wears the edge. */
  foundId: string | null;
}
