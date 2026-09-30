/** A project in the recent list; `exists` tells whether the folder still holds a project. */
export interface KnownProject {
  id: string;
  name: string;
  directory: string;
  openedAt: Date;
  exists: boolean;
  agentCount: number;
}
