import { BrowserWindow } from "electron";
import { WALKS_CHANGED_CHANNEL, WALKS_HEARD_CHANNEL, WALKS_WRITTEN_CHANNEL } from "../../contracts";
import type { ProviderHeard, WalkSnapshot } from "../../contracts";
import type { WalkVoice } from "../../modules/walks";

/** Tells the one window what happens to the conversation; dropped when there is no window. */
export class WindowWalkVoice implements WalkVoice {
  changed(snapshot: WalkSnapshot): void {
    this.send(WALKS_CHANGED_CHANNEL, snapshot);
  }

  written(): void {
    this.send(WALKS_WRITTEN_CHANNEL, null);
  }

  heard(heard: ProviderHeard): void {
    this.send(WALKS_HEARD_CHANNEL, heard);
  }

  private send(channel: string, payload: unknown): void {
    const [window] = BrowserWindow.getAllWindows();

    window?.webContents.send(channel, payload);
  }
}
