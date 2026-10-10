import { walkSnapshot } from "../logic";
import type { ProviderHeard, WalkState } from "../../../contracts";
import type { EarsOwner, WalkListener, WalkVoice } from "../interfaces";

/** Tells the screen what one conversation does, for as long as that conversation is the one open. */
export class WalkEars implements WalkListener {
  constructor(
    private readonly voice: WalkVoice,
    private readonly owner: EarsOwner,
  ) {}

  changed(state: WalkState): void {
    if (this.owner.isHearing(this)) {
      this.voice.changed(walkSnapshot(state));
    }
  }

  written(): void {
    if (this.owner.isHearing(this)) {
      this.voice.written();
    }
  }

  heard(heard: ProviderHeard): void {
    if (this.owner.isHearing(this)) {
      this.voice.heard(heard);
    }
  }
}
