import type { MouseEvent } from "react";
import type { Agent } from "../../../../../../interfaces";
import type { UndoOffer } from "../../../../../project";
import type { ArmedOrb, CanvasDrawing, CanvasLiving, CanvasPicked, CanvasStanding } from "../../../../interfaces";
import type { Point } from "../../../../../../utils/math";

/** Everything drawn in the canvas's own coordinates, and the acts a sphere or a line answers with. */
export interface CanvasLayersProps {
  standing: CanvasStanding;
  living: CanvasLiving;
  picked: CanvasPicked;
  drawing: CanvasDrawing;
  /** Every deletion still returnable, so the place it stood is kept marked. */
  undoOffers: UndoOffer[];
  pan: Point;
  scale: number;
  onSelectLink: (linkId: string) => void;
  onDeleteLink: (linkId: string) => void;
  onSphereMenu: (event: MouseEvent, agentId: string) => void;
  onGrabSphere: (event: MouseEvent, agent: Agent) => void;
  onSelectSphere: (agent: Agent) => void;
  /** A press on one agent's mark — the mark itself, and the box it stands in on the screen. */
  onPressOrb: (agent: Agent, orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer resting on one agent's «+» raises the list it holds. */
  onPointToOrb: (agent: Agent, orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer left a mark: what it raised waits a moment before going. */
  onPointAwayFromOrb: () => void;
}
