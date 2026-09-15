import { useEffect, useRef, useState } from "react";
import { CANVAS_WINDOW_AWAY_MS } from "../../constants";
import type { ArmedMarkRow, ArmedOrb } from "../../interfaces";
import type { CanvasMarkStanding, CanvasMenuStanding, CanvasWindows } from "./interfaces";

/**
 * What stands open **over** the canvas: the right-click menu and the window a mark of the arc raises.
 * They are one thing and not two — at most one of them stands at a time, both are bound to a place on the canvas
 * rather than to the screen, and so any move of the canvas, any drag and the next click put them away together.
 *
 * The one thing they do not share is what opens them: the menu waits for a press, and the mark's window follows
 * the pointer. That is why the waiting lives here — between the pointer leaving a mark and the window going away
 * there is a gap the hand crosses to reach it, and the window says while it holds that hand.
 */
export function useCanvasWindows(
  onOpenAgentTools: (agentId: string, group: string | null, grantId: string | null) => void,
  onPickAgent: (agentId: string) => void,
): CanvasWindows {
  const [menu, setMenu] = useState<CanvasMenuStanding | null>(null);
  const [mark, setMark] = useState<CanvasMarkStanding | null>(null);
  // The wait between the pointer leaving a mark and what it raised going away; cleared the moment it is not owed.
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

  /** The window goes, but not this instant: the way into it is across the gap above the mark that raised it. */
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
      /**
       * A mark stands for one thing and names it, so the press goes straight to that thing's page.
       * A «+» names no source — it raises the window of what it hides, here on the canvas, and the
       * agent's tab is not touched at all.
       */
      if (orb.folded === null) {
        onOpenAgentTools(agent.id, orb.group, orb.grantId);

        return;
      }

      // The sphere is chosen by this press as by any other on the arc: two different choices never happen.
      onPickAgent(agent.id);
      setMenu(null);
      setMark(standingOf(agent.id, orb, at));
    },
    /**
     * The window opens on the **pointer**, and on every mark: a mini-sphere that says nothing under the cursor is
     * anonymous, and the arc is then a row of shapes the hand has to press to read. The press stays for choosing.
     */
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

      // The window was a road and not a place, so it shuts behind the line that was chosen.
      setMark(null);
      onOpenAgentTools(mark.agentId, row.group, row.grantId);
    },
  };
}

/**
 * What one mark of the arc says under the pointer. A «+» says the порода it folds and a line for each of them
 *; a mark of its own says its kind and its own name, and that one line is the whole of it — «MCP-СЕРВЕР ·
 * playwright-mcp», «КОМАНДА ПРОЄКТУ · run_lint». Nothing at all only where a mark names no source and folds none,
 * which no mark does.
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
