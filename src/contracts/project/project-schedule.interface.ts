/** A task put to one agent at every interval while the project stands open. */
export interface ProjectSchedule {
  id: string;
  /** Null while no agent is chosen. */
  agentId: string | null;
  task: string | null;
  everyMinutes: number | null;
  isActive: boolean;
}
