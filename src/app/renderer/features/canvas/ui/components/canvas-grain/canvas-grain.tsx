import { CANVAS_GRAIN_IMAGE, CANVAS_GRAIN_OPACITY } from "../../../constants";

/**
 * The grain over the whole field: a drawing and nothing else — it takes no pointer, knows no state, and is here
 * only so the canvas's own file stays about what happens on it rather than about what it looks like.
 */
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
