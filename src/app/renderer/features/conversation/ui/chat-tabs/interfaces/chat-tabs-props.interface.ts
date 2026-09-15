import type { ChatTab } from "./chat-tab.type";

export interface ChatTabsProps {
  active: ChatTab;
  /** Empties the stream and starts a fresh one; the runs stay in the history. */
  onFresh: () => void;
  onActiveChange: (tab: ChatTab) => void;
  /** How many runs the history is showing — the act carries that number and dims at zero. */
  runs: number;
  /** Takes every run the history is showing. */
  onForgetAll: () => void;
  /** A conversation not on screen holds a turn that waits for the hand — the history wears a quiet dot. */
  isNews: boolean;
}
