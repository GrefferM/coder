import { createPortal } from "react-dom";
import {
  HINT_BACKGROUND_COLOR,
  HINT_BORDER_COLOR,
  HINT_BORDER_RADIUS_PX,
  HINT_COLOR,
  HINT_FONT_SIZE_PX,
  HINT_GAP_PX,
  HINT_LINE_HEIGHT,
  HINT_NAME_WIDTH_PX,
  HINT_PADDING,
  HINT_READING_LINES,
  HINT_READING_WIDTH_PX,
  HINT_SHADOW,
} from "./constants";
import type { HintProps } from "./interfaces";

/**
 * The app's one hint window: recognition names a wordless thing in one line cut with «…»; reading shows a cut line
 * whole, wrapped. Rendered into the body, never takes the mouse.
 */
export function Hint({ text, isReading, at }: HintProps) {
  const isAbove = at.top > window.innerHeight - at.bottom;

  return createPortal(
    <div
      role="tooltip"
      style={{
        position: "fixed",
        left: at.left,
        ...(isAbove
          ? {
              bottom: window.innerHeight - at.top + HINT_GAP_PX,
            }
          : {
              top: at.bottom + HINT_GAP_PX,
            }),
        zIndex: 100,
        maxWidth: isReading ? HINT_READING_WIDTH_PX : HINT_NAME_WIDTH_PX,
        padding: HINT_PADDING,
        borderRadius: HINT_BORDER_RADIUS_PX,
        border: `1px solid ${HINT_BORDER_COLOR}`,
        background: HINT_BACKGROUND_COLOR,
        boxShadow: HINT_SHADOW,
        fontSize: HINT_FONT_SIZE_PX,
        lineHeight: HINT_LINE_HEIGHT,
        color: HINT_COLOR,
        pointerEvents: "none",
        ...(isReading
          ? {
              display: "-webkit-box",
              WebkitBoxOrient: "vertical" as const,
              WebkitLineClamp: HINT_READING_LINES,
              overflow: "hidden",
              overflowWrap: "anywhere",
            }
          : {
              whiteSpace: "nowrap" as const,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }),
      }}
    >
      {text}
    </div>,
    document.body,
  );
}
