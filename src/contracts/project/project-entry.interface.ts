/** One project this machine knows about, as the lists show it. */
export interface ProjectEntry {
  id: string;
  name: string;
  directory: string;
  openedAt: string;
  exists: boolean;
  agentCount: number;
}
