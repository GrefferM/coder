import type { ChatMessage, TurnOut } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";

/** What the widget's output is laid out from. */
export interface ExchangesAsked {
  /** The stream on screen: the live conversation, or a run opened from the history with the live words under it. */
  messages: ChatMessage[];
  /** The turns still out. */
  out: TurnOut[];
  /** The walks that are out, by their keys. */
  walking: string[];
  config: ProjectConfig;
  /** The sphere whose questions are shown. */
  agentId: string;
}
