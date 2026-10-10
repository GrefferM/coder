import type { ToolSource } from "../../../contracts";

/** One call as it happened; a refused call has `refusal` and no code, a run call has both. */
export interface AddCall {
  /** The call's id from the stream, also the one a server's failure count points at. */
  id: string;
  /** What the call went to. */
  source: ToolSource;
  name: string;
  arguments: Record<string, string>;
  /** Names the person pinned, to tell them from the model's choices. */
  pinned: string[];
  line: string;
  output: string;
  refusal: string;
  exitCode: number | null;
  /** The server the call went to and its name then; none for a command's call. */
  serverId: string | null;
  serverName: string;
  end: string;
  startedAt: number;
  endedAt: number;
}
