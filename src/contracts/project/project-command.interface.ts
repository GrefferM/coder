import type { CommandParameter } from "./command-parameter.interface";

/** A command the user declares: a run line, a description for the model, and parameters. */
export interface ProjectCommand {
  id: string;
  name: string;
  description: string;
  run: string;
  parameters: CommandParameter[];
}
