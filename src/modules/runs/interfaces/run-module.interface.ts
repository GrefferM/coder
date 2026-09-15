import type { RunController } from "../controllers";
import type { RunKeeper } from "../services";

/** What `createRunModule` hands back: the controller for the channels, and the keeper for the housekeeping. */
export interface RunModule {
  controller: RunController;
  keeper: RunKeeper;
}
