import type { ProviderHeard } from "../../../contracts";
import type { WalkListener, WalkVoice } from "../interfaces";

/** Tells the screen what a schedule's conversation wrote and whom it reached; its walks are on no screen. */
export class ScheduleEars implements WalkListener {
  constructor(private readonly voice: WalkVoice) {}

  changed(): void {
    return;
  }

  written(): void {
    this.voice.written();
  }

  heard(heard: ProviderHeard): void {
    this.voice.heard(heard);
  }
}
