import type { CanvasAgentActs } from "./canvas-agent-acts.interface";
import type { CanvasLinkActs } from "./canvas-link-acts.interface";
import type { CanvasLiving } from "./canvas-living.interface";
import type { CanvasNotes } from "./canvas-notes.interface";
import type { CanvasPicked } from "./canvas-picked.interface";
import type { CanvasStanding } from "./canvas-standing.interface";
import type { CanvasViewStanding } from "./canvas-view.interface";
import type { CanvasWriteActs } from "./canvas-write-acts.interface";

/**
 * What the canvas is handed, by owner: what stands on it, what is alive, what is picked, its bottom notes, its place,
 * and the acts grouped by target.
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
