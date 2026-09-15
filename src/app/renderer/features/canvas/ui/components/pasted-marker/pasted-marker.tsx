import {
  CANVAS_PASTED_BACKGROUND_COLOR,
  CANVAS_PASTED_BORDER_COLOR,
  CANVAS_PASTED_BORDER_RADIUS_PX,
  CANVAS_PASTED_COLOR,
  CANVAS_PASTED_FONT_SIZE_PX,
  CANVAS_PASTED_LABEL_OFFSET_X_PX,
  CANVAS_PASTED_LETTER_SPACING_PX,
  CANVAS_PASTED_PADDING,
  CANVAS_PASTED_PREFIX,
  CANVAS_PASTED_RING_COLOR,
  CANVAS_PASTED_RING_OPACITY,
  CANVAS_PASTED_RING_SIZE_PX,
  CANVAS_PASTED_SEPARATOR,
  CANVAS_PASTED_SUFFIX,
} from "../../../constants";
import type { PastedMarkerProps } from "./interfaces";

/** Ring and source name on a fresh copy, until the next canvas act. */
export function PastedMarker({ sourceName, at }: PastedMarkerProps) {
  return (
    <>
      <span
        style={{
          position: "absolute",
          left: at.x,
          top: at.y,
          transform: "translate(-50%, -50%)",
          width: CANVAS_PASTED_RING_SIZE_PX,
          height: CANVAS_PASTED_RING_SIZE_PX,
          borderRadius: "50%",
          border: `1px dashed ${CANVAS_PASTED_RING_COLOR}`,
          opacity: CANVAS_PASTED_RING_OPACITY,
        }}
      />
      <span
        className="d-flex align-items-center font-monospace text-uppercase text-nowrap"
        style={{
          position: "absolute",
          left: at.x + CANVAS_PASTED_LABEL_OFFSET_X_PX,
          top: at.y,
          transform: "translateY(-50%)",
          padding: CANVAS_PASTED_PADDING,
          borderRadius: CANVAS_PASTED_BORDER_RADIUS_PX,
          border: `1px solid ${CANVAS_PASTED_BORDER_COLOR}`,
          background: CANVAS_PASTED_BACKGROUND_COLOR,
          color: CANVAS_PASTED_COLOR,
          fontSize: CANVAS_PASTED_FONT_SIZE_PX,
          letterSpacing: CANVAS_PASTED_LETTER_SPACING_PX,
        }}
      >
        {`${CANVAS_PASTED_PREFIX} ${sourceName}${CANVAS_PASTED_SEPARATOR}${CANVAS_PASTED_SUFFIX}`}
      </span>
    </>
  );
}
