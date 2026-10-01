import type { RunController } from "../controllers";
import type { RunKeeper, RunReader } from "../services";

/**
 * What `createRunModule` returns: the controller for the channels, the keeper for housekeeping, and the reader an agent
 * called as a tool reads the shared memory from.
 */
export interface RunModule {
  controller: RunController;
  keeper: RunKeeper;
  reader: RunReader;
}
