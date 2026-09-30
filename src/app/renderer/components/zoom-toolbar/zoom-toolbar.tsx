import { ZoomButton } from "./components";
import { CANVAS_LAYER } from "../../constants";
import {
  ZOOM_IN_LABEL,
  ZOOM_OUT_LABEL,
  ZOOM_TOOLBAR_BACKGROUND_COLOR,
  ZOOM_TOOLBAR_BORDER_COLOR,
  ZOOM_TOOLBAR_BORDER_RADIUS_PX,
  ZOOM_TOOLBAR_COLOR,
  ZOOM_TOOLBAR_FONT_SIZE_PX,
  ZOOM_TOOLBAR_GAP_PX,
  ZOOM_TOOLBAR_LETTER_SPACING_PX,
  ZOOM_TOOLBAR_OFFSET_PX,
  ZOOM_TOOLBAR_PADDING_PX,
  ZOOM_TOOLBAR_SCALE_WIDTH_PX,
} from "./constants";
import { ZOOM_SCALE_PERCENT, ZOOM_SCALE_STOPS } from "../zoom-field";
import type { ZoomToolbarProps } from "./interfaces";

/** Corner toolbar: current scale with a step either side, dead at the surface's ends. */
export function ZoomToolbar({ scale, stops = ZOOM_SCALE_STOPS, onZoomOut, onZoomIn }: ZoomToolbarProps) {
  return (
    <div
      className="d-flex align-items-center"
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      role="presentation"
      style={{
        position: "absolute",
        left: ZOOM_TOOLBAR_OFFSET_PX,
        bottom: ZOOM_TOOLBAR_OFFSET_PX,
        zIndex: CANVAS_LAYER,
        gap: ZOOM_TOOLBAR_GAP_PX,
        padding: ZOOM_TOOLBAR_PADDING_PX,
        borderRadius: ZOOM_TOOLBAR_BORDER_RADIUS_PX,
        border: `1px solid ${ZOOM_TOOLBAR_BORDER_COLOR}`,
        background: ZOOM_TOOLBAR_BACKGROUND_COLOR,
      }}
    >
      <ZoomButton label={ZOOM_OUT_LABEL} isDisabled={scale <= stops.min} onSelect={onZoomOut} />
      <span
        className="d-flex justify-content-center font-monospace"
        style={{
          width: ZOOM_TOOLBAR_SCALE_WIDTH_PX,
          color: ZOOM_TOOLBAR_COLOR,
          fontSize: ZOOM_TOOLBAR_FONT_SIZE_PX,
          letterSpacing: ZOOM_TOOLBAR_LETTER_SPACING_PX,
        }}
      >
        {Math.round(scale * ZOOM_SCALE_PERCENT)}%
      </span>
      <ZoomButton label={ZOOM_IN_LABEL} isDisabled={scale >= stops.max} onSelect={onZoomIn} />
    </div>
  );
}
