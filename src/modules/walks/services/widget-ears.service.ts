import { walkSnapshot } from "../logic";
import type { ProviderHeard, WalkState } from "../../../contracts";
import type { WalkListener, WalkVoice, WidgetVoice } from "../interfaces";

/** Tells the widget how one sphere's walks stand, and the main window what was written and whom it reached. */
export class WidgetEars implements WalkListener {
  constructor(
    private readonly agentId: string,
    private readonly widget: WidgetVoice,
    private readonly voice: WalkVoice,
  ) {}

  changed(state: WalkState): void {
    this.widget.changed({
      agentId: this.agentId,
      snapshot: walkSnapshot(state),
    });
  }

  written(): void {
    this.voice.written();
  }

  heard(heard: ProviderHeard): void {
    this.voice.heard(heard);
  }
}
