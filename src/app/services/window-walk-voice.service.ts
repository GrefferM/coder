import { WALKS_CHANGED_CHANNEL, WALKS_HEARD_CHANNEL, WALKS_WRITTEN_CHANNEL } from "../../contracts";
import type { ProviderHeard, WalkSnapshot } from "../../contracts";
import type { WalkVoice } from "../../modules/walks";
import type { AppWindows } from "./app-windows.service";

/** Tells the main window what happens to the person's conversation; dropped while it is not open. */
export class WindowWalkVoice implements WalkVoice {
  constructor(private readonly windows: AppWindows) {}

  changed(snapshot: WalkSnapshot): void {
    this.windows.toMain(WALKS_CHANGED_CHANNEL, snapshot);
  }

  written(): void {
    this.windows.toMain(WALKS_WRITTEN_CHANNEL, null);
  }

  heard(heard: ProviderHeard): void {
    this.windows.toMain(WALKS_HEARD_CHANNEL, heard);
  }
}
