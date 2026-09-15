import type { McpSecretsHeld, ProjectMcpServer, UnsavedWork } from "../../../../../interfaces";
import type { ServerBurden, ServerFormValues } from "../../../interfaces";

/** The section's own state — which server is open in the form, and what stands in it. */
export interface ServerSection {
  openServerId: string | "new" | null;
  openServer: ProjectMcpServer | null;
  form: ServerFormValues | null;
  /** What this machine holds for the open server, and what was typed in this time. */
  held: McpSecretsHeld;
  secrets: Record<string, string>;
  editSecret: (name: string, value: string) => void;
  isDirty: boolean;
  unsaved: UnsavedWork | null;
  /** The server a question stands over, and what goes with it if the answer is yes. */
  armedServer: ProjectMcpServer | null;
  armedBurden: ServerBurden;
  arm: (serverId: string | null) => void;
  confirmDelete: () => void;
  dismissDelete: () => void;
  openForm: (serverId: string | "new" | null) => void;
  editForm: (patch: Partial<ServerFormValues>) => void;
  saveForm: () => Promise<void>;
}
