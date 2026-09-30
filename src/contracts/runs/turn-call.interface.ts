import type { ToolSource } from "../project";

/** One call of a turn while it is live. */
export interface TurnCall {
  /** The call's id, the same when it goes out and when it is over. */
  id: string;
  /** What the call went to. */
  source: ToolSource;
  name: string;
  arguments: Record<string, string>;
  /** Arguments the person pinned; the rest the model decided. */
  pinned: string[];
  line: string;
  output: string;
  refusal: string;
  exitCode: number | null;
  /** The server this call went to and its name then; `null` for a command's call. */
  serverId: string | null;
  serverName: string;
  /** The server answered «ні»; a command says that by exit code. */
  isFailed: boolean;
  startedAt: number;
  endedAt: number;
}
