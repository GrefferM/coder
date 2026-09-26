import {
  CANVAS_PILL_BACKGROUND_COLOR,
  CANVAS_PILL_BORDER_COLOR,
  CANVAS_PILL_DONE_BORDER_COLOR,
  CANVAS_PILL_FAILED_BACKGROUND_COLOR,
  CANVAS_PILL_FAILED_BORDER_COLOR,
  CANVAS_PILL_IN_ANIMATION,
  CANVAS_PILL_MAX_WIDTH,
  CANVAS_PILL_OUT_ANIMATION,
  CANVAS_PILL_SHADOW,
  CANVAS_PILL_BORDER_RADIUS_PX,
  CANVAS_PILL_BOTTOM_PX,
  CANVAS_PILL_FONT_SIZE_PX,
  CANVAS_PILL_LETTER_SPACING_PX,
  CANVAS_PILL_PADDING,
  CANVAS_PILL_TOP_IN_ANIMATION,
  CANVAS_PILL_TOP_PX,
} from "./constants";
import { CANVAS_LAYER, NOTE_LAYER } from "../../../../../constants";
import type { CanvasPillProps } from "./interfaces";

/** Canvas pill along the bottom, or the top; only one at a time in each place, toned by subject. */
export function CanvasPill({
  ref,
  gapPx,
  children,
  tone = "step",
  isLeaving = false,
  place = "bottom",
}: CanvasPillProps) {
  const isTop = place === "top";
  const entrance = isTop ? CANVAS_PILL_TOP_IN_ANIMATION : CANVAS_PILL_IN_ANIMATION;
  const borderColor =
    tone === "done"
      ? CANVAS_PILL_DONE_BORDER_COLOR
      : tone === "failed"
        ? CANVAS_PILL_FAILED_BORDER_COLOR
        : CANVAS_PILL_BORDER_COLOR;

  return (
    <div
      ref={ref}
      className="d-flex align-items-center font-monospace text-uppercase"
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      role="presentation"
      style={{
        position: "absolute",
        ...(isTop
          ? {
              top: CANVAS_PILL_TOP_PX,
            }
          : {
              bottom: CANVAS_PILL_BOTTOM_PX,
            }),
        maxWidth: CANVAS_PILL_MAX_WIDTH,
        overflow: "hidden",
        left: "50%",
        transform: "translateX(-50%)",
        // The top place is the app's own word, and it stands over the project badge that shares that edge.
        zIndex: isTop ? NOTE_LAYER : CANVAS_LAYER,
        gap: gapPx,
        padding: CANVAS_PILL_PADDING,
        borderRadius: CANVAS_PILL_BORDER_RADIUS_PX,
        border: `1px solid ${borderColor}`,
        background: tone === "failed" ? CANVAS_PILL_FAILED_BACKGROUND_COLOR : CANVAS_PILL_BACKGROUND_COLOR,
        boxShadow: CANVAS_PILL_SHADOW,
        animation: isLeaving ? CANVAS_PILL_OUT_ANIMATION : entrance,
        fontSize: CANVAS_PILL_FONT_SIZE_PX,
        letterSpacing: CANVAS_PILL_LETTER_SPACING_PX,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}
