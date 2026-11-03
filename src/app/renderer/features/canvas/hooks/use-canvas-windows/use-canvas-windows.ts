import { useEffect, useRef, useState } from "react";
import { CANVAS_WINDOW_AWAY_MS } from "../../constants";
import type { ArmedMarkRow, ArmedOrb } from "../../interfaces";
import type { CanvasMarkStanding, CanvasMenuStanding, CanvasWindows } from "./interfaces";

/**
 * What stands open over the canvas: the right-click menu or the window a mark of the arc raises. At most one at a time,
 * bound to a canvas place, closed by any canvas move, drag or next click. The menu opens on a press, the mark's window
 * on the pointer.
 */
export function useCanvasWindows(
  onOpenAgentTools: (agentId: string, group: string | null, grantId: string | null) => void,
  onPickAgent: (agentId: string) => void,
): CanvasWindows {
  const [menu, setMenu] = useState<CanvasMenuStanding | null>(null);
  const [mark, setMark] = useState<CanvasMarkStanding | null>(null);
  // The wait between the pointer leaving a mark and its window closing.
  const going = useRef<number | null>(null);

  function stay() {
    if (going.current !== null) {
      window.clearTimeout(going.current);
      going.current = null;
    }
  }

  function close() {
    stay();
    setMenu(null);
    setMark(null);
  }

  /** Closes the window after a short delay, so the pointer can cross the gap into it. */
  function goSoon() {
    stay();
    going.current = window.setTimeout(() => setMark(null), CANVAS_WINDOW_AWAY_MS);
  }

  useEffect(() => stay, []);

  return {
    menu,
    mark,
    openMenu: (standing) => {
      setMark(null);
      setMenu(standing);
    },
    close,
    pressOrb: (agent, orb, at) => {
      /** A single mark goes straight to its page; a «+» raises its window and leaves the agent's tab alone. */
      if (orb.folded === null) {
        onOpenAgentTools(agent.id, orb.group, orb.grantId);

        return;
      }

      // Selects the sphere as any other press on the arc does.
      onPickAgent(agent.id);
      setMenu(null);
      setMark(standingOf(agent.id, orb, at));
    },
    /** The window opens on the pointer over any mark; a press chooses. */
    pointToOrb: (agent, orb, at) => {
      const standing = standingOf(agent.id, orb, at);

      stay();

      if (standing === null) {
        setMark(null);

        return;
      }

      setMenu(null);
      setMark(standing);
    },
    pointAwayFromOrb: goSoon,
    holdMark: (isHeld) => {
      if (isHeld) {
        stay();

        return;
      }

      goSoon();
    },
    openMarkRow: (row: ArmedMarkRow) => {
      if (mark === null) {
        return;
      }

      // Closes the window once a line is chosen.
      setMark(null);
      onOpenAgentTools(mark.agentId, row.group, row.grantId);
    },
  };
}

/**
 * What a mark says under the pointer: a «+» gives a line per folded mark; a mark of its own gives its kind and name on
 * one line, e.g. «MCP-СЕРВЕР · playwright-mcp».
 */
function standingOf(agentId: string, orb: ArmedOrb, at: HTMLElement): CanvasMarkStanding | null {
  const rows =
    orb.folded ??
    (orb.group === null
      ? null
      : [
          {
            group: orb.group,
            grantId: orb.grantId,
            name: orb.hint.name,
            color: orb.color,
            isBroken: orb.isBroken,
          },
        ]);

  return rows === null
    ? null
    : {
        agentId,
        at: at.getBoundingClientRect(),
        head: orb.hint.kind,
        rows,
      };
}
