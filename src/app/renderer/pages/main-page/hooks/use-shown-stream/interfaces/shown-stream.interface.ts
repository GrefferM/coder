import type { ChatHead, ChatMessage, ChatTab } from "../../../../../features/conversation";
import type { RunHit } from "../../../../../features/record";
import type { NamedAgent } from "../../../../../interfaces";
import type { RunRow } from "../../../../../features/record";

/** Which stream is shown, the live one or a run read back, and the list's actions. */
export interface ShownStream {
  /** The open chat tab: current or past. */
  tab: ChatTab;
  showTab: (tab: ChatTab) => void;
  messages: ChatMessage[];
  /** The stream's agents: today's, or the record's own for a removed one. */
  agents: NamedAgent[];
  head: ChatHead | null;
  /** Writes the shown stream as a plain-text transcript to the chosen path. */
  exportChat: () => void;
  /** The run the stream stands on: the opened one, or the row the live conversation writes into. */
  shownRunId: string | null;
  runs: RunRow[];
  isFailed: boolean;
  /** Only ended runs can be deleted, so only they are counted and offered. */
  endedRuns: RunRow[];
  doomedRun: RunRow | null;
  armForget: (run: RunRow) => void;
  dismissForget: () => void;
  forgetRun: () => Promise<void>;
  doomedRuns: RunRow[] | null;
  armForgetAll: () => void;
  dismissForgetAll: () => void;
  forgetAllRuns: () => Promise<void>;
  fresh: () => void;
  openRun: (run: RunRow, found: RunHit | null) => void;
  /** The search word, shared by the history and the stream. */
  query: string;
  search: (query: string) => void;
  hits: RunHit[];
  /** The hit a pressed row drove the stream to, or null. */
  drivenTo: RunHit | null;
  /** Whether the caret belongs in the stream's field. */
  isTyping: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  /** The stream's messages containing the word; «3 З 8» counts these. */
  inStream: string[];
  /** Which of them the stream stands on, counted from nought. */
  standingAt: number;
  /** The message the stream rides to and marks. */
  foundId: string | null;
  toNextFound: () => void;
  toPreviousFound: () => void;
}
