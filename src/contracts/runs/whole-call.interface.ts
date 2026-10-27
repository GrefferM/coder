import type { CallSource } from "./call-source.type";

/** One call of a step read back from the record; a refused one has no output and no code. */
export interface WholeCall {
  id: string;
  source: CallSource;
  place: number;
  name: string;
  arguments: Record<string, string>;
  /** Arguments the person pinned, per the grant at the time of the run. */
  pinned: string[];
  /** The line as it ran, values filled in; empty for a call that never started. */
  line: string;
  output: string;
  refusal: string;
  exitCode: number | null;
  /** The server this call went to and its name then; `null` for a command's or an agent's call. */
  serverId: string | null;
  serverName: string;
  /** The server answered «ні», read from the end the record kept. */
  isFailed: boolean;
  end: string;
  startedAt: Date;
  endedAt: Date;
}
