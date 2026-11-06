import type { AgentChatState } from "../../../../../features/conversation";
import type { NamedAgent } from "../../../../../interfaces";
import type { AgentDraft } from "../../../../../features/agents";
import type { AgentMend } from "../../../../../features/agents";
import type { ShownStream } from "../../../hooks/use-shown-stream";
import type { ReadAloud, VoiceAsk } from "../../../../../features/speech";

export interface ChatSectionProps {
  chat: AgentChatState;
  stream: ShownStream;
  /** The project's agents as they stand now; the history names rows by them. */
  agents: NamedAgent[];
  /** The agent the stream is aimed at; null while nobody is. */
  aimed: AgentDraft | null;
  /** The question said into the field (4j). */
  voice: VoiceAsk;
  /** The one voice an answer is read with (4k). */
  aloud: ReadAloud;
  onOpenDebug: ((questionId: string) => void) | null;
  onOpenProviders: () => void;
  onOpenModel: () => void;
  /** Opens the consent window over a server a turn waited on. */
  onShowConsent: (serverId: string) => void;
  /** A card's act opens the agent's tab on the place the card named. */
  onOpenAgentAt: (place: AgentMend) => void;
}
