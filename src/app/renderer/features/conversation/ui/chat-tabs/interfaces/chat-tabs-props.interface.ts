import type { ChatTab } from "./chat-tab.type";

export interface ChatTabsProps {
  active: ChatTab;
  /** Empties the stream and starts a fresh one; runs stay in the history. */
  onFresh: () => void;
  onActiveChange: (tab: ChatTab) => void;
  /** How many runs the history shows; the act carries it and dims at zero. */
  runs: number;
  /** Takes every ended run of the project; a running one stays. */
  onForgetAll: () => void;
  /** An off-screen conversation holds a turn waiting for the hand; the history wears a quiet dot. */
  isNews: boolean;
}
