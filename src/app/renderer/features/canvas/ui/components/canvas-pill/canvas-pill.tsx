import {
  CANVAS_PILL_BACKGROUND_COLOR,
  CANVAS_PILL_BORDER_COLOR,
  CANVAS_PILL_DONE_BORDER_COLOR,
  CANVAS_PILL_FAILED_BACKGROUND_COLOR,
  CANVAS_PILL_FAILED_BORDER_COLOR,
  CANVAS_PILL_IN_ANIMATION,
  CANVAS_PILL_OUT_ANIMATION,
  CANVAS_PILL_SHADOW,
  CANVAS_PILL_BORDER_RADIUS_PX,
  CANVAS_PILL_BOTTOM_PX,
  CANVAS_PILL_FONT_SIZE_PX,
  CANVAS_PILL_LETTER_SPACING_PX,
  CANVAS_PILL_PADDING,
} from "./constants";
import { CANVAS_LAYER } from "../../../../../constants";
import type { CanvasPillProps } from "./interfaces";

/** Bottom canvas pill; only one at a time, toned by subject. */
export function CanvasPill({ ref, gapPx, children, tone = "step", isLeaving = false }: CanvasPillProps) {
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
        bottom: CANVAS_PILL_BOTTOM_PX,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: CANVAS_LAYER,
        gap: gapPx,
        padding: CANVAS_PILL_PADDING,
        borderRadius: CANVAS_PILL_BORDER_RADIUS_PX,
        border: `1px solid ${borderColor}`,
        background: tone === "failed" ? CANVAS_PILL_FAILED_BACKGROUND_COLOR : CANVAS_PILL_BACKGROUND_COLOR,
        boxShadow: CANVAS_PILL_SHADOW,
        animation: isLeaving ? CANVAS_PILL_OUT_ANIMATION : CANVAS_PILL_IN_ANIMATION,
        fontSize: CANVAS_PILL_FONT_SIZE_PX,
        letterSpacing: CANVAS_PILL_LETTER_SPACING_PX,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}
