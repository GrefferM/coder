import { useRef } from "react";
import { useWindowDismiss } from "../../../../hooks";
import type { RefObject } from "react";

/** Closes an open list at a press anywhere outside the box the returned ref marks; a press inside leaves it be. */
export function useListDismiss(isOpen: boolean, onClose: () => void): RefObject<HTMLDivElement | null> {
  const box = useRef<HTMLDivElement>(null);

  useWindowDismiss(
    isOpen,
    (event) => {
      if (event.target instanceof Node && box.current?.contains(event.target) === true) {
        return;
      }

      onClose();
    },
    "press",
  );

  return box;
}
