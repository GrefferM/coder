import type { MouseEvent } from "react";
import type { Agent } from "../../../../../../interfaces";
import type { UndoOffer } from "../../../../../project";
import type { ArmedOrb, CanvasDrawing, CanvasLiving, CanvasPicked, CanvasStanding } from "../../../../interfaces";
import type { Point } from "../../../../../../utils/math";

/** Everything drawn in the canvas's coordinates, and the acts a sphere or line answers with. */
export interface CanvasLayersProps {
  standing: CanvasStanding;
  living: CanvasLiving;
  picked: CanvasPicked;
  drawing: CanvasDrawing;
  /** Every deletion still undoable; the place it stood stays marked. */
  undoOffers: UndoOffer[];
  pan: Point;
  scale: number;
  onSelectLink: (linkId: string) => void;
  onDeleteLink: (linkId: string) => void;
  onSphereMenu: (event: MouseEvent, agentId: string) => void;
  onGrabSphere: (event: MouseEvent, agent: Agent) => void;
  onSelectSphere: (agent: Agent) => void;
  /** A press on an agent's mark: the mark and its on-screen box. */
  onPressOrb: (agent: Agent, orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer resting on an agent's «+» raises its list. */
  onPointToOrb: (agent: Agent, orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer left a mark; what it raised closes after a delay. */
  onPointAwayFromOrb: () => void;
}
