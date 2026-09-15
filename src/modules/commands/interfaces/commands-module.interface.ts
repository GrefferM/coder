import type { CommandRunner } from "../services";

/** What `createCommandsModule` hands back: the runner the app gives to whoever calls commands. */
export interface CommandsModule {
  runner: CommandRunner;
}
