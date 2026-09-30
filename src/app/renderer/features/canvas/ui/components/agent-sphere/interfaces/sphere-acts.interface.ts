import type { MouseEvent } from "react";
import type { ArmedOrb } from "../../../../interfaces";

/** Every act on the sphere itself and on the marks of the arc beside it. */
export interface SphereActs {
  onSelect: () => void;
  onGrab: (event: MouseEvent<HTMLDivElement>) => void;
  onMenu: (event: MouseEvent<HTMLDivElement>) => void;
  /** A press on a mark of the arc: the mark and its element. */
  onPressOrb: (orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer resting on a mark raises the list a «+» holds. */
  onPointToOrb: (orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer left a mark; what it raised closes after a delay. */
  onPointAwayFromOrb: () => void;
}
