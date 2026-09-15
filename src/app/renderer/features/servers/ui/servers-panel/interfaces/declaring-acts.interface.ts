import type { ServerFormValues } from "../../../interfaces";

/** What can be done to the form: opening it over the list, writing in it, and the two ways out of it. */
export interface DeclaringActs {
  onOpenForm: (serverId: string | "new" | null) => void;
  onFormChange: (patch: Partial<ServerFormValues>) => void;
  onSecretChange: (name: string, value: string) => void;
  onSaveForm: () => Promise<void>;
  onCancelForm: () => void;
}
