import { WalkController } from "./controllers";
import { ScheduledWalks, WalkHub } from "./services";
import type { WalkHubParts, WalksModule } from "./interfaces";

export function createWalksModule(parts: WalkHubParts): WalksModule {
  const hub = new WalkHub(parts);

  return {
    controller: new WalkController(hub),
    hub,
    scheduled: new ScheduledWalks(parts),
  };
}
