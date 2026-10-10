import type { ProviderHeard, WalkSnapshot } from "../../../contracts";
import type { WalkVoice } from "../interfaces";

/** A voice that keeps what the screen would have been told. */
export class RecordingVoice implements WalkVoice {
  readonly snapshots: WalkSnapshot[] = [];
  readonly heards: ProviderHeard[] = [];
  writes = 0;

  changed(snapshot: WalkSnapshot): void {
    this.snapshots.push(snapshot);
  }

  written(): void {
    this.writes += 1;
  }

  heard(heard: ProviderHeard): void {
    this.heards.push(heard);
  }
}
