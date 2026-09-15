import type { SidePanelItem } from "../../../../../components";
import type { McpLook } from "../../../../../interfaces";
import type { AgentState } from "../../../../../features/agents/interfaces";
import type { AgentChatState } from "../../../../../features/conversation";
import type { OpenedPassState } from "../../../../../features/projection";
import type { ProvidersState } from "../../../../../features/providers";
import type { ShownStream } from "../../use-shown-stream/interfaces";
import type { RailStanding } from "../../use-rail-standing/interfaces";

/**
 * Everything the open project's screen stands on, each part whole and named after what owns it — so a caller says
 * which one it reads instead of depending on every field of all of them.
 */
export interface PageParts {
  /** The rail's seven sections, wired to their panels. */
  items: SidePanelItem[];
  /** What the machine knows: the providers, what each answered, and who is being asked. */
  machine: ProvidersState;
  /** The live conversation — every walk out, what has been said, and what is written. */
  chat: AgentChatState;
  /** The stream the panel shows, with its two forgetting paths. */
  stream: ShownStream;
  /** The projection over the canvas — the pass it stands on, and the ways about it. */
  pass: OpenedPassState;
  /** Which section of the rail stands open, and every way in and out of it. */
  rail: RailStanding;
  /** The state of every agent, so the canvas and the panel say the same thing. */
  agentStates: Record<string, AgentState>;
  /** What each declared server hands over right now — nothing of it is in the project file. */
  looks: Record<string, McpLook>;
}
