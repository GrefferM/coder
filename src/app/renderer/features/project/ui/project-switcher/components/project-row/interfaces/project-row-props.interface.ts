/** `agentCount` is `null` when uncounted; `exists` false means the folder no longer holds a project. */
export interface ProjectRowProps {
  name: string;
  directory: string;
  agentCount?: number | null;
  isCurrent?: boolean;
  exists?: boolean;
  onSelect?: () => void;
  onForget?: () => void;
}
