import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import type { Runnable } from "@langchain/core/runnables";
import type { AgentTool, ReachableAgent } from "../../../contracts/llm";
import type { ProjectMcpServer } from "../../../contracts/project/mcp-server.interface";

/** One turn as it runs: the model with its tools bound, the conversation so far, and what its calls reach. */
export interface RunningTurn {
  /** The turn id its pieces are said under; `null` for a sub-agent's turn, which says nothing onward. */
  voicedAs: string | null;
  answering: Runnable<BaseMessage[], AIMessageChunk> | BaseChatModel;
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
}
