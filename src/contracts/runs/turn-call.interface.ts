/** One call of a turn while it is live. */
export interface TurnCall {
  /** The same call is said when it goes out and again when it is over, under this id. */
  id: string;
  name: string;
  arguments: Record<string, string>;
  /** Which of the arguments the person pinned; the rest the model decided. */
  pinned: string[];
  line: string;
  output: string;
  refusal: string;
  exitCode: number | null;
  /** The server this call went to, and the name it wore then. A command's call ran a program and has neither. */
  serverId: string | null;
  serverName: string;
  /** The server answered «ні». A command says that with its exit code; a server has no code. */
  isFailed: boolean;
  startedAt: number;
  endedAt: number;
}
