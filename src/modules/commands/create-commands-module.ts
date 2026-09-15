import { CommandRunner } from "./services";
import type { CommandsModule } from "./interfaces";

export function createCommandsModule(): CommandsModule {
  return {
    runner: new CommandRunner(),
  };
}
