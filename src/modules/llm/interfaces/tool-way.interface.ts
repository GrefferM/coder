import type { RouteChoice, ToolMemory } from "../../../contracts/llm";
import type { ChatCost } from "../../../contracts/walks/chat-cost.interface";
import type { CallSource } from "../../../contracts/runs";

/**
 * What one call says of itself when minted: where it went, what it was given, and which arguments the person pinned.
 */
export interface CallStanding {
  source: CallSource;
  name: string;
  arguments: Record<string, string>;
  pinned: string[];
  /** The server this call goes to and its current name; `null` for a command's or an agent's call. */
  serverId: string | null;
  serverName: string;
}

/** What a call came to: the fields the row gains, and whether the far side said no. */
export interface CallResult {
  line: string;
  output: string;
  exitCode: number | null;
  isFailed: boolean;
  /** What an agent's turn cost; a command and a server's function cost the turn nothing of its own. */
  cost: ChatCost | null;
  /** What an agent's call had compressed on the way; a command and a server's function compress nothing. */
  memories: ToolMemory[];
  /** What a route call decided; the other kinds of call decide nothing. */
  route: RouteChoice | null;
}

/**
 * One way of making a call: a declared command is the person's line, checked against their declared types and run as a
 * process; a server's function is asked over a connection, unchecked; another agent runs a whole turn. The row minting,
 * saying and handing to the model is shared.
 */
export interface ToolWay {
  /** What the row says the moment it is minted. */
  standing(): CallStanding;
  /** Why the call must not go out, or `null`: a command's arguments against its declared types, an agent's ring. */
  refusal(): string | null;
  /** The call itself, once the person has been told it is out. */
  make(callId: string, directory: string, signal: AbortSignal): Promise<CallResult>;
}
