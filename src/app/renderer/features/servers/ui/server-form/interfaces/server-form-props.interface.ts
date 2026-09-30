import type { McpSecretsHeld } from "../../../../../interfaces";
import type { ServerFormValues } from "../../../interfaces";

export interface ServerFormProps {
  values: ServerFormValues;
  /** «Підключити» for a new server, «Зберегти» for an existing one. */
  isNew: boolean;
  /** Names already declared in this project, this server's own excepted; a duplicate is refused. */
  takenNames: string[];
  /** What this machine holds for this server: only whether, never the secrets. */
  held: McpSecretsHeld;
  /** What was typed into the secret fields this time; the token is under the empty key. */
  secrets: Record<string, string>;
  onChange: (patch: Partial<ServerFormValues>) => void;
  /** A variable's name, or the empty string for the token. */
  onSecretChange: (name: string, value: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
}
