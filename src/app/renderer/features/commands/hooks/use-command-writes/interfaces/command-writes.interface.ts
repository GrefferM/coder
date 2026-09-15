import type { CommandFormValues } from "../../../interfaces";

/** A command declared or changed, and a command taken away with its grants. */
export interface CommandWrites {
  saveCommand: (commandId: string | null, values: CommandFormValues) => Promise<void>;
  deleteCommand: (commandId: string) => Promise<void>;
}
