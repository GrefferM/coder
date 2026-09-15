import type { Agent } from "../../../../../interfaces";
import type { ArmedMarkRow, ArmedOrb } from "../../../interfaces";
import type { Point } from "../../../../../utils/math";

/** The right-click menu, where it stands and what it was opened over. */
export interface CanvasMenuStanding {
  at: Point;
  contentAt: Point;
  agentId: string | null;
}

/** What a mark of the arc says under the pointer, bound to that mark's own box on the screen. */
export interface CanvasMarkStanding {
  agentId: string;
  at: DOMRect;
  /** What kind of thing this is — «MCP-СЕРВЕР», «КОМАНДА ПРОЄКТУ», «ЩЕ 3 СЕРВЕРИ» on a «+». */
  head: string;
  /** One line for a mark of its own, a line per folded mark under a «+»; each leads where its mark leads. */
  rows: ArmedMarkRow[];
}

export interface CanvasWindows {
  menu: CanvasMenuStanding | null;
  mark: CanvasMarkStanding | null;
  openMenu: (standing: CanvasMenuStanding) => void;
  /** Whatever stands open goes; the canvas moving is the same word to both of them. */
  close: () => void;
  /** A mark of its own leads to its page; a «+» raises the window of what it hides. */
  pressOrb: (agent: Agent, orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer resting on any mark raises what that mark says. */
  pointToOrb: (agent: Agent, orb: ArmedOrb, at: HTMLElement) => void;
  /** The pointer left a mark: what it raised waits a moment, because the way into it is across that same gap. */
  pointAwayFromOrb: () => void;
  /** The window says when it holds the hand, and while it does the waiting does not end in closing. */
  holdMark: (isHeld: boolean) => void;
  /** A line leads where its mark would have led, and the window shuts behind it. */
  openMarkRow: (row: ArmedMarkRow) => void;
}
