import { useState, type MouseEvent, type RefObject } from "react";
import {
  ZOOM_DEFAULT_SCALE,
  ZOOM_DRAG_THRESHOLD_PX,
  ZOOM_FIT_PADDING_PX,
  ZOOM_SCALE_PLACES,
  ZOOM_SCALE_STOPS,
  ZOOM_UNMOVED,
} from "./constants";
import { fitView, hasLeft, nextScaleStop, roundedTo } from "../../utils/math";
import type { ScaleStops, Point } from "../../utils/math";
import type { ZoomField, ZoomPlace } from "./interfaces";

/**
 * A pan-and-zoom field: pan, scale, box-to-content arithmetic, and the left-button drag over empty space. It knows
 * nothing of what stands on it.
 */
export function useZoomField(
  fieldRef: RefObject<HTMLDivElement | null>,
  onDragStart: () => void,
  onDragEnd: () => void,
  opening: ZoomPlace | null,
  stops: ScaleStops = ZOOM_SCALE_STOPS,
): ZoomField {
  // The view as this machine last left it; the scale is held within bounds whatever was noted.
  const [pan, setPan] = useState<Point>(opening?.pan ?? ZOOM_UNMOVED);
  const [isPanning, setIsPanning] = useState(false);
  const [scale, setScale] = useState(
    opening === null ? ZOOM_DEFAULT_SCALE : Math.min(stops.max, Math.max(stops.min, opening.scale)),
  );

  /** Where in the canvas's own box the pointer is. */
  function pointAt(clientX: number, clientY: number): Point {
    const box = fieldRef.current?.getBoundingClientRect();

    return {
      x: clientX - (box?.left ?? 0),
      y: clientY - (box?.top ?? 0),
    };
  }

  /** The same pointer in the coordinates agents are stored in. */
  function contentPointAt(clientX: number, clientY: number): Point {
    const point = pointAt(clientX, clientY);

    return {
      x: (point.x - pan.x) / scale,
      y: (point.y - pan.y) / scale,
    };
  }

  /** Scales around a box point, keeping what is under it still; callers ask for a step or a fit, never a raw scale. */
  function scaleAround(wanted: number, at: Point) {
    const next = roundedTo(Math.min(stops.max, Math.max(stops.min, wanted)), ZOOM_SCALE_PLACES);
    const held = {
      x: (at.x - pan.x) / scale,
      y: (at.y - pan.y) / scale,
    };

    setScale(next);
    setPan({
      x: roundedTo(at.x - held.x * next, ZOOM_SCALE_PLACES),
      y: roundedTo(at.y - held.y * next, ZOOM_SCALE_PLACES),
    });
  }

  /** One step: the scale walks its own stops, nothing in between. */
  function stepAround(direction: number, at: Point) {
    scaleAround(nextScaleStop(scale, direction, stops), at);
  }

  /**
   * Double click fits everything; with nothing there the field stays. The ceiling is the field's own unless the caller
   * passes a lower one.
   */
  function fitAll(points: Point[], ceiling = stops.max) {
    const box = fieldRef.current?.getBoundingClientRect();
    const fitted = fitView(
      points,
      {
        width: box?.width ?? 0,
        height: box?.height ?? 0,
      },
      {
        ...stops,
        max: ceiling,
      },
      ZOOM_FIT_PADDING_PX,
    );

    if (fitted === null) {
      return;
    }

    setScale(fitted.scale);
    setPan({
      x: roundedTo(fitted.pan.x, ZOOM_SCALE_PLACES),
      y: roundedTo(fitted.pan.y, ZOOM_SCALE_PLACES),
    });
  }

  /** Box middle — the point the toolbar buttons hold still. */
  function boxCentre(): Point {
    const box = fieldRef.current?.getBoundingClientRect();

    return {
      x: (box?.width ?? 0) / 2,
      y: (box?.height ?? 0) / 2,
    };
  }

  /** Below the threshold the press stays a click; move and release are watched on the window. */
  function grabField(event: MouseEvent) {
    if (event.button !== 0) {
      return;
    }

    const grabbed = pointAt(event.clientX, event.clientY);
    const grabbedPan = pan;
    let hasMoved = false;

    function handleMouseMove(move: globalThis.MouseEvent) {
      const point = pointAt(move.clientX, move.clientY);

      if (!hasMoved && !hasLeft(grabbed, point, ZOOM_DRAG_THRESHOLD_PX)) {
        return;
      }

      hasMoved = true;
      onDragStart();
      setIsPanning(true);
      setPan({
        x: grabbedPan.x + point.x - grabbed.x,
        y: grabbedPan.y + point.y - grabbed.y,
      });
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (!hasMoved) {
        return;
      }

      onDragEnd();
      setIsPanning(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  return {
    pan,
    scale,
    isPanning,
    pointAt,
    contentPointAt,
    stepAround,
    fitAll,
    boxCentre,
    grabField,
  };
}
