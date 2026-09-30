import type { NamedAgent, WorkingAgent } from "../../../../../interfaces";
import type { ChatMessage } from "../../../interfaces";
import type { OpenCalls } from "../../../hooks";

/** What stands in the stream: the words, who said them, and what is still being said. */
export interface ChatSaid {
  messages: ChatMessage[];
  agents: NamedAgent[];
  /** Every agent with a turn out, with what it says and ran. */
  working: WorkingAgent[];
  /** Which call rows are open; handed in because the catalogue can open one too and both must share the same memory. */
  openCalls: OpenCalls;
  /** Turns already asked again; the act under a turn stands until used. */
  saidAgain: string[];
  /** The message the search drove to; the stream scrolls to it and it wears the edge. */
  foundId: string | null;
}
