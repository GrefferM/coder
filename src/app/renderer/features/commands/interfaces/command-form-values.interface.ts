import type { CommandParameter } from "../../../interfaces";

/** A command as its form holds it while being declared or changed — every field as text. */
export interface CommandFormValues {
  name: string;
  description: string;
  run: string;
  parameters: CommandParameter[];
}
