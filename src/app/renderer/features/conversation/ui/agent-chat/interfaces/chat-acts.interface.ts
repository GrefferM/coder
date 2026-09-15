import type { ChatMessage } from "../../../interfaces";

/** Where a card's act leads — every way out of the stream, each named by where it goes. */
export interface ChatActs {
  onOpenProviders: () => void;
  onOpenSettings: () => void;
  /** «ВІДКРИТИ ПРОМПТ» — the field that still names the prompt whose file is gone. */
  onOpenPrompt: () => void;
  /** «ВІДКРИТИ ВИДАЧУ» — the grants, where a tie to a lost function still hangs. */
  onOpenGrants: () => void;
  onOpenModel: () => void;
  /** Asks one agent the same question again, from the row the act stands under. */
  onAskAgain: (said: ChatMessage) => void;
  /** The walk this question started — the projection is opened by it, never by the hour. */
  onOpenDebug: ((questionId: string) => void) | null;
}
