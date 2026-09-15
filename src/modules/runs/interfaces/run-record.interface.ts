/** The columns the `runs` table holds; the entity implements it. */
export interface RunRecord {
  id: string;
  directory: string;
  startedByAgentId: string;
  startedAt: Date;
  endedAt: Date | null;
}
