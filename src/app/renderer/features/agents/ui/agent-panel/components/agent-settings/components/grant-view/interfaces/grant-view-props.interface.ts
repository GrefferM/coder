import type { CommandToolGrant, ProjectCommand } from "../../../../../../../../../interfaces";

/** `command` is `null` when the source command is gone; changes go up as a whole grant. */
export interface GrantViewProps {
  agentName: string;
  grant: CommandToolGrant;
  command: ProjectCommand | null;
  onGrantChange: (grant: CommandToolGrant) => void;
  onBack: () => void;
  onSave: () => Promise<void>;
}
