/** A task put to one agent at every interval while the app stands open; whether it runs is each machine's own. */
export interface ProjectSchedule {
  id: string;
  /** Null while no agent is chosen. */
  agentId: string | null;
  task: string | null;
  everyMinutes: number | null;
}
