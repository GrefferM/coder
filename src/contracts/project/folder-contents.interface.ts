/** Contents of the chosen folder; `name` is the project's when one exists, else the folder's. */
export interface FolderContents {
  hasProject: boolean;
  name: string;
  agentCount: number;
  linkCount: number;
  promptCount: number;
}
