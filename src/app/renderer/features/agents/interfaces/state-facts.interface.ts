import type {
  McpLook,
  ProjectConfig,
  ProviderAnswer,
  ProviderState,
  WaitingAgent,
  WorkingAgent,
} from "../../../interfaces";

/**
 * What an agent's state is read against: the project as it stands, the machine around it, and what the
 * conversation on screen has every agent doing. One named thing, since a state is the answer to all of them at
 * once and a caller handing them over in a row could not say which was which.
 */
export interface StateFacts {
  config: ProjectConfig;
  providers: ProviderState[];
  /** What each provider last answered when it was asked, by provider id. */
  answers: Record<string, ProviderAnswer>;
  /** What each declared server hands over right now, by server id; a break can hang on a lost function. */
  looks: Record<string, McpLook>;
  /** The agents with a turn out in this conversation. */
  working: WorkingAgent[];
  /** The agents holding work while their suppliers have their turns. */
  waiting: WaitingAgent[];
  /** When an agent's last word was a fall, by agent id. */
  fellAt: Record<string, string>;
}
