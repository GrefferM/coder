export interface RunRecord {
  id: string;
  directory: string;
  startedByAgentId: string;
  startedByScheduleId: string | null;
  startedAt: Date;
  endedAt: Date | null;
}
