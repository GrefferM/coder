import type { ServerFormValues } from "../../../interfaces";

/** Acts on the form: open it over the list, write in it, and the two ways out. */
export interface DeclaringActs {
  onOpenForm: (serverId: string | "new" | null) => void;
  onFormChange: (patch: Partial<ServerFormValues>) => void;
  onSecretChange: (name: string, value: string) => void;
  onSaveForm: () => Promise<void>;
  onCancelForm: () => void;
}
