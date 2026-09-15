import type { AgentChatState } from "../../../../../features/conversation";
import type { NamedAgent } from "../../../../../interfaces";
import type { AgentDraft } from "../../../../../features/agents";
import type { AgentMend } from "../../../../../features/agents";
import type { ShownStream } from "../../../hooks/use-shown-stream";

export interface ChatSectionProps {
  chat: AgentChatState;
  stream: ShownStream;
  /** The project's agents as they stand today — the history names its rows by them, not by the record. */
  agents: NamedAgent[];
  /** The agent the stream is aimed at; null while nobody is. */
  aimed: AgentDraft | null;
  onOpenDebug: ((questionId: string) => void) | null;
  onOpenProviders: () => void;
  onOpenModel: () => void;
  /** A card's act goes to the agent's tab and opens it on the place that card named. */
  onOpenAgentAt: (place: AgentMend) => void;
}
