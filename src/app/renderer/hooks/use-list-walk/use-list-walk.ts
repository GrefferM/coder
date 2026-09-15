import { useCallback, useEffect, useRef, useState } from "react";
import { keepInSight } from "../../utils/sight";
import type { ListWalk, WalkedKey } from "./interfaces";

/**
 * A list that opens is walked — the arrows move along the rows and Enter takes the one they stand on. It
 * opens standing on `from`, which is the row already chosen where there is one.
 */
export function useListWalk(count: number, isOpen: boolean, onEnter: (index: number) => void, from = 0): ListWalk {
  const [walked, setWalked] = useState(from);
  // Ref mirrors state: the row to open on is read when the list opens, and the walk is the person's own after that.
  const opensOn = useRef(from);

  opensOn.current = from;

  useEffect(() => {
    setWalked(opensOn.current);
  }, [isOpen]);

  // Only the walked row holds this, so React calls it the moment the walk arrives at a row.
  const walkedRow = useCallback((node: HTMLElement | null) => {
    if (node !== null) {
      keepInSight(node);
    }
  }, []);

  return {
    walked: Math.min(walked, Math.max(count - 1, 0)),
    walkTo: setWalked,
    walkedRow,
    onKeyDown: (event: WalkedKey) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setWalked((standing) => {
          const next = standing + (event.key === "ArrowDown" ? 1 : -1);

          return Math.min(Math.max(next, 0), Math.max(count - 1, 0));
        });

        return;
      }

      if (event.key === "Enter" && count > 0) {
        event.preventDefault();
        onEnter(Math.min(walked, count - 1));
      }
    },
  };
}
