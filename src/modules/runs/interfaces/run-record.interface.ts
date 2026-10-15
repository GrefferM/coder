export interface RunRecord {
  id: string;
  directory: string;
  startedByAgentId: string;
  startedAt: Date;
  endedAt: Date | null;
}
