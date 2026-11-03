import type { ChatMessage, RepeatProgress } from "../../../interfaces";
import type { PickedAttachment } from "../../../../../interfaces";
import type { OpenCalls } from "../../use-open-calls";
import type { LinkLife, WaitingAgent, WorkingAgent } from "../../../../../interfaces";

/** Chat state the agents section holds for the selected agent. */
export interface AgentChatState {
  /** When an agent's last word was a fall, for «упав · 14:26». */
  fellAt: Record<string, string>;
  /** Whom a question would go to: the selected agent, or the one asked last. */
  aimedAgentId: string | null;
  /** Points the chat at an agent without the canvas taking part. */
  aim: (agentId: string) => void;
  /** Empties the stream and its draft; leaves the record, the aim and opened runs' drafts alone. */
  fresh: () => void;
  /** Asks one agent the same question again, as a turn of its own in the same conversation. */
  sayAgain: (said: ChatMessage) => void;
  /** The turns already asked again — the act under them is spent. */
  saidAgain: string[];
  /** The run this stream writes into, so the projection can open on it. */
  runId: string | null;
  /** A run opened from history becomes the record the stream keeps writing into. */
  goOnIn: (runId: string) => void;
  /** The record this stream writes into was deleted; the conversation goes with it. */
  letGo: (runId: string) => void;
  messages: ChatMessage[];
  draft: string;
  isWorking: boolean;
  /** A conversation not on screen holds a turn that waits for the hand; this session's news only. */
  isNewsElsewhere: boolean;
  /** The history is open; standing news is cleared. */
  readNews: () => void;
  /** Count of writes to the record; the history reads it to follow a walk. */
  written: number;
  startedAt: number | null;
  working: WorkingAgent[];
  /** The agents holding work while lines converge. */
  waiting: WaitingAgent[];
  /** How each canvas line stands; a line with no life is absent. */
  linkLives: Record<string, LinkLife>;
  /** Which call rows stand open; shared with the catalogue, which opens rows too. */
  openCalls: OpenCalls;
  /** Height the person pulled the project's field to; null if never pulled. */
  fieldHeight: number | null;
  /** Sets it at the end of a pull; the page notes it beside the canvas scale. */
  setFieldHeight: (height: number) => void;
  changeDraft: (draft: string) => void;
  /** Attached under the on-screen stream's field, to go with the next question. */
  attachments: PickedAttachment[];
  /** «+ ПРИКРІПИТИ»: opens the native pick and adds the choice to this stream's attachments. */
  attach: () => void;
  /** The × on a chip: removes the attachment with that path. */
  detach: (path: string) => void;
  send: () => void;
  /** Ends the on-screen walk and any repeats under way. */
  stop: () => void;
  /** «x1»: how many times the next question goes in a row. */
  repeats: number;
  setRepeats: (count: number) => void;
  /** Repeats under way, for «2/5»; `null` when none go. */
  repeating: RepeatProgress | null;
}
