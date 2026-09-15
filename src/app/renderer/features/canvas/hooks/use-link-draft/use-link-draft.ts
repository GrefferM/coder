import { useEffect, useState } from "react";

import { useWindowKeydown } from "../../../../hooks";
import { LINK_DRAFT_CANCELLED_MS } from "../../constants";
import type { DrawnLine, LinkDraftState } from "./interfaces";
import type { Point } from "../../../../utils/math";

/**
 * The line being drawn on the canvas. It leaves a sphere, follows the pointer, and ends one of three ways
 * — drawn onto a sphere that took it, crossed out where it was let go over nothing, or dropped by Escape. A cancelled
 * line is kept only while it fades.
 */
export function useLinkDraft(): LinkDraftState {
  const [drawn, setDrawn] = useState<DrawnLine | null>(null);
  const [cancelled, setCancelled] = useState<DrawnLine | null>(null);

  useWindowKeydown(drawn !== null, (event) => {
    if (event.key === "Escape") {
      cancel();
    }
  });

  useEffect(() => {
    if (cancelled === null) {
      return;
    }

    const going = window.setTimeout(() => setCancelled(null), LINK_DRAFT_CANCELLED_MS);

    return () => window.clearTimeout(going);
  }, [cancelled]);

  /** A line let go over nothing is redrawn crossed out and fades. */
  function cancel() {
    setDrawn((line) => {
      setCancelled(line);

      return null;
    });
  }

  return {
    drawn,
    cancelled,
    drawFrom: (agentId: string, at: Point) =>
      setDrawn({
        agentId,
        at,
      }),
    followTo: (at: Point) =>
      setDrawn((line) =>
        line === null
          ? line
          : {
              ...line,
              at,
            },
      ),
    cancel,
    finish: () => setDrawn(null),
  };
}
