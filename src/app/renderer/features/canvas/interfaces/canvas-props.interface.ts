import type { CanvasAgentActs } from "./canvas-agent-acts.interface";
import type { CanvasLinkActs } from "./canvas-link-acts.interface";
import type { CanvasLiving } from "./canvas-living.interface";
import type { CanvasNotes } from "./canvas-notes.interface";
import type { CanvasPicked } from "./canvas-picked.interface";
import type { CanvasStanding } from "./canvas-standing.interface";
import type { CanvasViewStanding } from "./canvas-view.interface";
import type { CanvasWriteActs } from "./canvas-write-acts.interface";

/**
 * What the canvas is handed, each part named after what owns it: what stands on it, what is alive on it this
 * moment, what the person has singled out, what it says along its bottom, where it stands — and, apart from
 * those, the acts, grouped by what each acts upon.
 */
export interface CanvasProps {
  standing: CanvasStanding;
  living: CanvasLiving;
  picked: CanvasPicked;
  notes: CanvasNotes;
  view: CanvasViewStanding;
  agentActs: CanvasAgentActs;
  linkActs: CanvasLinkActs;
  writeActs: CanvasWriteActs;
}
