import type { CommandRunner } from "../services";

/** What `createCommandsModule` returns: the runner for whoever calls commands. */
export interface CommandsModule {
  runner: CommandRunner;
}
