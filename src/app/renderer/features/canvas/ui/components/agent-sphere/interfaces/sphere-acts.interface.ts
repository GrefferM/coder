import type { MouseEvent } from "react";
import type { ArmedOrb } from "../../../../interfaces";

/** Every hand on the sphere: on the sphere itself, and on the marks of the arc beside it. */
export interface SphereActs {
  onSelect: () => void;
  onGrab: (event: MouseEvent<HTMLDivElement>) => void;
  onMenu: (event: MouseEvent<HTMLDivElement>) => void;
  /** A press on a mark of the arc — it hands back the mark itself and where it stands. */
  onPressOrb: (orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer resting on a mark is what raises the list a «+» holds. */
  onPointToOrb: (orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer left a mark: what it raised waits a moment before going. */
  onPointAwayFromOrb: () => void;
}
