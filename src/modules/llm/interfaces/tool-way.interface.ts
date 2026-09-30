import type { ToolSource } from "../../../contracts/project";

/**
 * What one call says of itself when minted: where it went, what it was given, and which arguments the person pinned.
 */
export interface CallStanding {
  source: ToolSource;
  name: string;
  arguments: Record<string, string>;
  pinned: string[];
  /** The server this call goes to and its current name; `null` for a command's call. */
  serverId: string | null;
  serverName: string;
}

/** What a call came to: the fields the row gains, and whether the far side said no. */
export interface CallResult {
  line: string;
  output: string;
  exitCode: number | null;
  isFailed: boolean;
}

/**
 * One way of making a call: a declared command is the person's line, checked against their declared types and run as a
 * process; a server's function is asked over a connection, unchecked. The row minting, saying and handing to the model
 * is shared.
 */
export interface ToolWay {
  /** What the row says the moment it is minted. */
  standing(): CallStanding;
  /**
   * Why the call must not go out, or `null`; only a declared command has one: its arguments are checked against the
   * declared types.
   */
  refusal(): string | null;
  /** The call itself, once the person has been told it is out. */
  make(callId: string, directory: string, signal: AbortSignal): Promise<CallResult>;
}
