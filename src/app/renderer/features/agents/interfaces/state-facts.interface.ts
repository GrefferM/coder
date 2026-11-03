import type {
  McpLook,
  ProjectConfig,
  ProviderAnswer,
  ProviderState,
  WaitingAgent,
  WorkingAgent,
} from "../../../interfaces";

/** What an agent's state is read against: the project, the machine, and the conversation on screen. */
export interface StateFacts {
  config: ProjectConfig;
  providers: ProviderState[];
  /** Each provider's last answer, by provider id. */
  answers: Record<string, ProviderAnswer>;
  /** What each declared server offers, by server id. */
  looks: Record<string, McpLook>;
  /** The agents with a turn out in this conversation. */
  working: WorkingAgent[];
  /** Agents holding work while their suppliers take their turns. */
  waiting: WaitingAgent[];
  /** When an agent's last word was a fall, by agent id. */
  fellAt: Record<string, string>;
}
