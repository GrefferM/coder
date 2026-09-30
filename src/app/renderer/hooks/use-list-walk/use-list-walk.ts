import { useCallback, useEffect, useRef, useState } from "react";
import { keepInSight } from "../../utils/sight";
import type { ListWalk, WalkedKey } from "./interfaces";

/**
 * An open list is walked: arrows move along the rows, Enter takes the current one. It opens on `from`, the already
 * chosen row if any.
 */
export function useListWalk(count: number, isOpen: boolean, onEnter: (index: number) => void, from = 0): ListWalk {
  const [walked, setWalked] = useState(from);
  // The opening row is read once when the list opens; the walk is the person's after that.
  const opensOn = useRef(from);

  opensOn.current = from;

  useEffect(() => {
    setWalked(opensOn.current);
  }, [isOpen]);

  // Held by the walked row only, so React calls it as the walk arrives.
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
