/** The columns the `run_calls` table holds; the entity implements it. */
export interface RunCallRecord {
  id: string;
  place: number;
  name: string;
  arguments: string;
  pinned: string;
  line: string;
  output: string;
  refusal: string;
  exitCode: number | null;
  serverId: string | null;
  serverName: string | null;
  end: string;
  startedAt: Date;
  endedAt: Date;
}
