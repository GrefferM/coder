import { useState, type MouseEvent } from "react";
import { ZOOM_DRAG_THRESHOLD_PX } from "../../../../components";
import { hasLeft } from "../../../../utils/math";
import { quietly } from "../../../../utils/writes";
import type { Agent } from "../../../../interfaces";
import type { SphereDrag, SphereDragState } from "./interfaces";
import type { Point } from "../../../../utils/math";

/** Sphere drag: no snapping, keeps the grab offset, holds the drop point until the write settles or fails. */
export function useSphereDrag(
  contentPointAt: (clientX: number, clientY: number) => Point,
  onMoveAgent: (agentId: string, at: Point) => Promise<void>,
  onDragStart: () => void,
  onDragEnd: () => void,
): SphereDrag {
  const [drag, setDrag] = useState<SphereDragState | null>(null);

  function grabSphere(event: MouseEvent, agent: Agent) {
    if (event.button !== 0) {
      return;
    }

    // Keeps the press from the canvas behind, which pans on it.
    event.stopPropagation();

    const grabbed = contentPointAt(event.clientX, event.clientY);
    const from = {
      x: agent.x,
      y: agent.y,
    };
    const grip = {
      x: from.x - grabbed.x,
      y: from.y - grabbed.y,
    };
    let hasMoved = false;

    function centreAt(pointer: globalThis.MouseEvent): Point {
      const point = contentPointAt(pointer.clientX, pointer.clientY);

      return {
        x: point.x + grip.x,
        y: point.y + grip.y,
      };
    }

    function handleMouseMove(move: globalThis.MouseEvent) {
      if (!hasMoved && !hasLeft(grabbed, contentPointAt(move.clientX, move.clientY), ZOOM_DRAG_THRESHOLD_PX)) {
        return;
      }

      hasMoved = true;
      onDragStart();
      setDrag({
        agentId: agent.id,
        from,
        at: centreAt(move),
      });
    }

    function handleMouseUp(up: globalThis.MouseEvent) {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (!hasMoved) {
        return;
      }

      const dropped = centreAt(up);

      onDragEnd();
      setDrag({
        agentId: agent.id,
        from,
        at: dropped,
      });

      quietly(() => onMoveAgent(agent.id, dropped).finally(() => setDrag(null)));
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  return {
    drag,
    grabSphere,
  };
}
