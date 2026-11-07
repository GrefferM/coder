import type { WalkController } from "../controllers";
import type { ScheduledWalks, WalkHub } from "../services";

export interface WalksModule {
  controller: WalkController;
  hub: WalkHub;
  /** Where the schedules' tasks walk. */
  scheduled: ScheduledWalks;
}
