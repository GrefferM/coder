import type { AgentChatState } from "../../../../../features/conversation";
import type { NamedAgent } from "../../../../../interfaces";
import type { AgentDraft } from "../../../../../features/agents";
import type { AgentMend } from "../../../../../features/agents";
import type { ShownStream } from "../../../hooks/use-shown-stream";

export interface ChatSectionProps {
  chat: AgentChatState;
  stream: ShownStream;
  /** The project's agents as they stand now; the history names rows by them. */
  agents: NamedAgent[];
  /** The agent the stream is aimed at; null while nobody is. */
  aimed: AgentDraft | null;
  onOpenDebug: ((questionId: string) => void) | null;
  onOpenProviders: () => void;
  onOpenModel: () => void;
  /** A card's act opens the agent's tab on the place the card named. */
  onOpenAgentAt: (place: AgentMend) => void;
}
