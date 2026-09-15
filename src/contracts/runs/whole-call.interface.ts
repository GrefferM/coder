/** One call of a step, read back from the record; a refused one has no output and no code. */
export interface WholeCall {
  id: string;
  place: number;
  name: string;
  arguments: Record<string, string>;
  /** Which of the arguments the person pinned, as the grant stood at the time of the run. */
  pinned: string[];
  /** The line as it ran, with the values already in it; empty for a call that never started. */
  line: string;
  output: string;
  refusal: string;
  exitCode: number | null;
  /** The server this call went to, and the name it wore then; a command's call has neither. */
  serverId: string | null;
  serverName: string;
  /** The server answered «ні», read back from the end the record kept. */
  isFailed: boolean;
  end: string;
  startedAt: Date;
  endedAt: Date;
}
