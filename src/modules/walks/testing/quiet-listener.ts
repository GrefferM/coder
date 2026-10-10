import type { ProviderHeard, WalkState } from "../../../contracts";
import type { WalkListener } from "../interfaces";

/** A listener that keeps what it heard. */
export class QuietListener implements WalkListener {
  changes = 0;
  writes = 0;
  readonly heards: ProviderHeard[] = [];
  last: WalkState | null = null;

  changed(state: WalkState): void {
    this.changes += 1;
    this.last = state;
  }

  written(): void {
    this.writes += 1;
  }

  heard(heard: ProviderHeard): void {
    this.heards.push(heard);
  }
}
