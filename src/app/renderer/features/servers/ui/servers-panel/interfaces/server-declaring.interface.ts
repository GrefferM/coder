import type { McpSecretsHeld } from "../../../../../interfaces";
import type { ServerFormValues } from "../../../interfaces";

/** The form standing over the list while open, and what this machine already holds for it. */
export interface ServerDeclaring {
  /** The server being declared, `new` before one exists; `null` while only the list stands. */
  openServerId: string | "new" | null;
  form: ServerFormValues | null;
  held: McpSecretsHeld;
  secrets: Record<string, string>;
}
