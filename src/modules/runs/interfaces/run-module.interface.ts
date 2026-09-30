import type { RunController } from "../controllers";
import type { RunKeeper } from "../services";

/** What `createRunModule` returns: the controller for the channels, the keeper for housekeeping. */
export interface RunModule {
  controller: RunController;
  keeper: RunKeeper;
}
