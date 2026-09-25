/**
 * What one call says of itself the moment it is minted, before anything is said or run: where it went, what it
 * was given, and which of that the person pinned rather than the model choosing.
 */
export interface CallStanding {
  name: string;
  arguments: Record<string, string>;
  pinned: string[];
  /** The server this call goes to, and the name it wears now; a command's call has neither. */
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
 * One way of making a call. A declared command is the person's own line, checked against the types they declared
 * and run as a process; a server's function is the server's own, checked by nobody and asked over a connection.
 *
 * The two differ in the middle and nowhere else: the same row is minted, said the moment it goes out, said again
 * when it is over, and handed to the model as a message. That envelope is written once, by whoever holds the way.
 */
export interface ToolWay {
  /** What the row says the moment it is minted. */
  standing(): CallStanding;
  /**
   * Why the call must not go out at all, or nothing. Only a declared command has such a reason: the arguments are
   * checked against the types the person declared, and a wrong one is named rather than mended.
   */
  refusal(): string | null;
  /** The call itself, once the person has been told it is out. */
  make(callId: string, directory: string, signal: AbortSignal): Promise<CallResult>;
}
