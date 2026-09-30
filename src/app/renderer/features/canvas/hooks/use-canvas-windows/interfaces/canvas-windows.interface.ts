import type { Agent } from "../../../../../interfaces";
import type { ArmedMarkRow, ArmedOrb } from "../../../interfaces";
import type { Point } from "../../../../../utils/math";

/** The right-click menu: its place and what it was opened over. */
export interface CanvasMenuStanding {
  at: Point;
  contentAt: Point;
  agentId: string | null;
}

/** What a mark of the arc says under the pointer, bound to the mark's box on screen. */
export interface CanvasMarkStanding {
  agentId: string;
  at: DOMRect;
  /** Kind of thing: «MCP-СЕРВЕР», «КОМАНДА ПРОЄКТУ», «ЩЕ 3 СЕРВЕРИ» on a «+». */
  head: string;
  /** One line for a mark of its own, a line per folded mark under a «+». */
  rows: ArmedMarkRow[];
}

export interface CanvasWindows {
  menu: CanvasMenuStanding | null;
  mark: CanvasMarkStanding | null;
  openMenu: (standing: CanvasMenuStanding) => void;
  /** Closes whatever is open. */
  close: () => void;
  /** A mark of its own goes to its page; a «+» raises the window of what it folds. */
  pressOrb: (agent: Agent, orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer resting on any mark raises what that mark says. */
  pointToOrb: (agent: Agent, orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer left a mark; its window closes after a delay. */
  pointAwayFromOrb: () => void;
  /** While the window holds the pointer, the delay does not close it. */
  holdMark: (isHeld: boolean) => void;
  /** Goes where the row's mark would go, then closes the window. */
  openMarkRow: (row: ArmedMarkRow) => void;
}
