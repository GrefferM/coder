import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import type { Runnable } from "@langchain/core/runnables";
import type { UnwrittenMemory } from "../../../contracts";
import type { AgentTool, ChatTurn, ReachableAgent } from "../../../contracts/llm";
import type { ProjectMcpServer } from "../../../contracts/project/mcp-server.interface";
import type { TurnQuestion } from "./turn-question.interface";

export interface RunningTurn {
  /** The turn id its pieces are said under; `null` for a sub-agent's turn, which says nothing onward. */
  voicedAs: string | null;
  answering: Runnable<BaseMessage[], AIMessageChunk> | BaseChatModel;
  /** Said after the provider's own words when it refuses; the client's own, null for most. */
  failureHint: string | null;
  conversation: BaseMessage[];
  directory: string;
  maxCalls: number;
  answerCeiling: number;
  byName: Map<string, AgentTool>;
  servers: ProjectMcpServer[];
  signal: AbortSignal;
  /** Every agent reachable as a tool, by id. */
  reachable: Map<string, ReachableAgent>;
  /** The agents already running above this turn; calling one again would close a ring. */
  stack: ReadonlySet<string>;
  /** The question the turn works under, whose shared memory an agent it calls may be given. */
  question: TurnQuestion;
  /**
   * What each agent this turn called as a tool has been asked and has said so far, by agent id: the memory of one that
   * keeps its own, which lasts as long as this turn does.
   */
  threads: Map<string, ToolThread>;
  /**
   * What each agent called as a tool in this turn, or under it, has compressed of the question's shared memory, by
   * agent id, and the record is yet to be told of: the one map of the whole turn, so no call compresses it again.
   */
  unwritten: Map<string, UnwrittenMemory>;
}

/** One tool agent's own memory within a turn: its pairs since the last compression, behind the composer's message. */
export interface ToolThread {
  thread: ChatTurn[];
  /** The composer's message, told as it opens the first of them; empty where the thread was never compressed. */
  composed: string;
}
