import type { SidePanelItem } from "../../../../../components";
import type { McpLook } from "../../../../../interfaces";
import type { AgentState } from "../../../../../features/agents/interfaces";
import type { AgentChatState } from "../../../../../features/conversation";
import type { OpenedPassState } from "../../../../../features/projection";
import type { ProvidersState } from "../../../../../features/providers";
import type { ServerConsentState } from "../../../../../features/servers";
import type { ShownStream } from "../../use-shown-stream/interfaces";
import type { RailStanding } from "../../use-rail-standing/interfaces";

/** The open project's screen parts, one per owner. */
export interface PageParts {
  /** The rail's seven sections, wired to their panels. */
  items: SidePanelItem[];
  /** Providers, their answers, and who is being asked. */
  machine: ProvidersState;
  /** The live conversation: walks, messages, drafts. */
  chat: AgentChatState;
  /** The stream the panel shows, with its two forgetting paths. */
  stream: ShownStream;
  /** The projection over the canvas: its pass and navigation. */
  pass: OpenedPassState;
  /** The open rail section and its entry and exit paths. */
  rail: RailStanding;
  /** State of every agent, shared by canvas and panel. */
  agentStates: Record<string, AgentState>;
  /** What each declared server currently returns; not stored in the project file. */
  looks: Record<string, McpLook>;
  /** The window asking this machine's consent to a server's run line. */
  consent: ServerConsentState;
}
