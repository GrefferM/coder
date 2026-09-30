import { useRef, useState } from "react";
import { withinField } from "../../../../../../logic";
import type { FieldHeight } from "./interfaces";

/**
 * The field is resized by the strip over it and grows upwards; the height is reported at the end of the pull, not on
 * every move.
 */
export function useFieldHeight(height: number, onHeight: (height: number) => void): FieldHeight {
  const [pulled, setPulled] = useState<number | null>(null);
  const from = useRef({
    y: 0,
    height,
  });

  function pull(event: { clientY: number; pointerId: number; currentTarget: Element }): void {
    from.current = {
      y: event.clientY,
      height,
    };
    setPulled(height);
    event.currentTarget.setPointerCapture(event.pointerId);

    const target = <HTMLElement>event.currentTarget;

    function moved(move: PointerEvent): void {
      // Dragging up makes it taller; the floor stays put.
      setPulled(withinField(from.current.height + (from.current.y - move.clientY)));
    }

    function let_go(): void {
      target.removeEventListener("pointermove", moved);
      target.removeEventListener("pointerup", let_go);
      target.removeEventListener("pointercancel", let_go);
      setPulled((standing) => {
        if (standing !== null) {
          onHeight(standing);
        }

        return null;
      });
    }

    target.addEventListener("pointermove", moved);
    target.addEventListener("pointerup", let_go);
    target.addEventListener("pointercancel", let_go);
  }

  return {
    height: pulled ?? withinField(height),
    onPointerDown: pull,
    isPulled: pulled !== null,
  };
}
