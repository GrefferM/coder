import type { ChatMessage } from "../../../interfaces";
import type { OpenCalls } from "../../use-open-calls";
import type { LinkLife, WaitingAgent, WorkingAgent } from "../../../../../interfaces";

/** Chat state the agents section holds for the selected agent. */
export interface AgentChatState {
  /** When an agent's last word was a fall, for «упав · 14:26». */
  fellAt: Record<string, string>;
  /** Whom a question would go to — the selected agent, or the one asked last. */
  aimedAgentId: string | null;
  /** Points the chat at an agent without the canvas taking part. */
  aim: (agentId: string) => void;
  /** Empties the stream and leaves the record, the aim and the drafts alone. */
  fresh: () => void;
  /** Asks one agent the same question again — a turn of its own in the same conversation. */
  sayAgain: (said: ChatMessage) => void;
  /** The turns already asked again — the act under them is spent. */
  saidAgain: string[];
  /** The run this stream writes into, so the projection can be opened on it. */
  runId: string | null;
  /** A run opened from the history is the record the stream now goes on writing into. */
  goOnIn: (runId: string) => void;
  /** The record this stream writes into was deleted — let the conversation go with it. */
  letGo: (runId: string) => void;
  messages: ChatMessage[];
  draft: string;
  isWorking: boolean;
  /** A conversation not on screen holds a turn that waits for the hand — news of this session alone. */
  isNewsElsewhere: boolean;
  /** The history is open, so what stood as news is news no longer. */
  readNews: () => void;
  /** How many times the record has been written to — the history reads it to follow a walk. */
  written: number;
  startedAt: number | null;
  working: WorkingAgent[];
  /** The agents holding work while lines converge. */
  waiting: WaitingAgent[];
  /** How every line of the canvas stands right now; one with no life is not in it. */
  linkLives: Record<string, LinkLife>;
  /**
   * Which call rows stand open. It lives with the chat because it is the chat's own memory, and it is
   * handed out because the catalogue opens one too — one memory, or the two would disagree.
   */
  openCalls: OpenCalls;
  /** How tall the person pulled the field of this project; nothing where they never pulled it. */
  fieldHeight: number | null;
  /** Sets it, at the end of a pull; the page notes it down beside the canvas's own scale. */
  setFieldHeight: (height: number) => void;
  changeDraft: (draft: string) => void;
  send: () => void;
  stop: () => void;
}
