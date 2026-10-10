import type { WalkController } from "../controllers";
import type { WalkHub } from "../services";

/** What `createWalksModule` returns: the controller for the channels, and the hub the app may reach into. */
export interface WalksModule {
  controller: WalkController;
  hub: WalkHub;
}
