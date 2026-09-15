import type { McpSecretsHeld } from "../../../../../interfaces";
import type { ServerFormValues } from "../../../interfaces";

export interface ServerFormProps {
  values: ServerFormValues;
  /** «Підключити» on a server that does not exist yet, «Зберегти» on one that does. */
  isNew: boolean;
  /** The names already declared in this project, this server's own excepted; a second one of a name is refused. */
  takenNames: string[];
  /** What this machine already holds for this server — never the secrets, only whether. */
  held: McpSecretsHeld;
  /** What was typed into the secret fields this time; the token lives under the empty key. */
  secrets: Record<string, string>;
  onChange: (patch: Partial<ServerFormValues>) => void;
  /** One name for one variable, or the empty string for the token. */
  onSecretChange: (name: string, value: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
}
