import type { CommandRunner } from "../services";

export interface CommandsModule {
  runner: CommandRunner;
}
