import type { CommandParameter } from "./command-parameter.interface";

export interface ProjectCommand {
  id: string;
  name: string;
  description: string;
  run: string;
  parameters: CommandParameter[];
}
