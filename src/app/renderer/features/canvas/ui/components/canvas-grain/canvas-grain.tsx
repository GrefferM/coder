import { CANVAS_GRAIN_IMAGE, CANVAS_GRAIN_OPACITY } from "../../../constants";

/** The grain over the whole field: a pure drawing, no pointer, no state. */
export function CanvasGrain() {
  return (
    <span
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: CANVAS_GRAIN_IMAGE,
        opacity: CANVAS_GRAIN_OPACITY,
        pointerEvents: "none",
      }}
    />
  );
}
