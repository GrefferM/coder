import type { ChatMessage } from "../../../interfaces";

/** Where a card's act leads: every way out of the stream, named by destination. */
export interface ChatActs {
  onOpenProviders: () => void;
  onOpenSettings: () => void;
  /** «ВІДКРИТИ ПРОМПТ»: the field that still names the prompt whose file is gone. */
  onOpenPrompt: () => void;
  /** «ВІДКРИТИ ВИДАЧУ»: the grants, where a tie to a lost function still hangs. */
  onOpenGrants: () => void;
  onOpenModel: () => void;
  /** «ПОКАЗАТИ, ЩО ЗАПУСТИТЬСЯ»: the window of 36k over the server the turn waited on, by its id. */
  onShowConsent: (serverId: string) => void;
  /** Asks one agent the same question again, from the row the act sits under. */
  onAskAgain: (said: ChatMessage) => void;
  /** Opens the projection of the walk this question started. */
  onOpenDebug: ((questionId: string) => void) | null;
}
