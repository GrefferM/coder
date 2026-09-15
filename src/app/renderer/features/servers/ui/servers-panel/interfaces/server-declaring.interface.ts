import type { McpSecretsHeld } from "../../../../../interfaces";
import type { ServerFormValues } from "../../../interfaces";

/** The one form standing over the list while it is open, and what this machine already holds for it. */
export interface ServerDeclaring {
  /** Which server is being declared, and `new` before one exists; `null` while the list stands alone. */
  openServerId: string | "new" | null;
  form: ServerFormValues | null;
  held: McpSecretsHeld;
  secrets: Record<string, string>;
}
