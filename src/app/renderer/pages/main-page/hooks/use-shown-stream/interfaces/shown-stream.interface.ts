import type { ChatHead, ChatMessage, ChatTab } from "../../../../../features/conversation";
import type { RunHit } from "../../../../../features/record";
import type { NamedAgent } from "../../../../../interfaces";
import type { RunRow } from "../../../../../features/record";

/** Which stream stands on screen — the live one or a run read back — and what the list does. */
export interface ShownStream {
  /** Which face of the chat stands open — what is going on, or what has been. */
  tab: ChatTab;
  showTab: (tab: ChatTab) => void;
  messages: ChatMessage[];
  /** Who the stream calls its agents — today's, and the record's own for an agent the project has let go. */
  agents: NamedAgent[];
  head: ChatHead | null;
  /** Writes the shown stream out as a plain-text transcript, where the person points the save chooser. */
  exportChat: () => void;
  /** The run the stream stands on — the opened one, or the row this conversation writes into. */
  shownRunId: string | null;
  runs: RunRow[];
  isFailed: boolean;
  /** Only an ended run can be deleted, so only ended runs are counted and offered. */
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
  /** The word looked for through the record — one word for the history and for the stream. */
  query: string;
  search: (query: string) => void;
  hits: RunHit[];
  /** The hit a pressed row drove the stream to; null where nobody was driven anywhere. */
  drivenTo: RunHit | null;
  /** The caret belongs in that field, the hand having asked for it. */
  isTyping: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  /** The messages of this stream the word stands in — «3 З 8» counts these and nothing else. */
  inStream: string[];
  /** Which of them the stream stands on, counted from nought. */
  standingAt: number;
  /** The message the stream rides to and marks. */
  foundId: string | null;
  toNextFound: () => void;
  toPreviousFound: () => void;
}
