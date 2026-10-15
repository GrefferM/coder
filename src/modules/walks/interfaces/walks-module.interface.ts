import type { WalkController } from "../controllers";
import type { WalkHub } from "../services";

export interface WalksModule {
  controller: WalkController;
  hub: WalkHub;
}
