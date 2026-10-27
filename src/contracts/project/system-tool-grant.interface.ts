import type { SystemCommandId } from "./system-command.constant";

/** One of the app's own commands granted to an agent; the command is told by its id, and the same in every project. */
export interface SystemToolGrant {
  id: string;
  source: "system";
  command: SystemCommandId;
}
