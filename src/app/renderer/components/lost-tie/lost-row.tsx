import {
  LOST_TIE_ROW_BACKGROUND_COLOR,
  LOST_TIE_ROW_BORDER_RADIUS_PX,
  LOST_TIE_ROW_GAP_PX,
  LOST_TIE_ROW_NAME_COLOR,
  LOST_TIE_ROW_NAME_FONT_SIZE_PX,
  LOST_TIE_ROW_PADDING,
  LOST_TIE_RULE_COLOR,
} from "./constants";
import type { LostRowProps } from "./interfaces";

/** A tie whose file is gone: the name it points at, struck through. */
export function LostRow({ name, children }: LostRowProps) {
  return (
    <div
      className="d-flex align-items-center"
      style={{
        padding: LOST_TIE_ROW_PADDING,
        gap: LOST_TIE_ROW_GAP_PX,
        borderRadius: LOST_TIE_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${LOST_TIE_RULE_COLOR}`,
        background: LOST_TIE_ROW_BACKGROUND_COLOR,
      }}
    >
      <span
        className="font-monospace flex-fill text-truncate"
        style={{
          color: LOST_TIE_ROW_NAME_COLOR,
          fontSize: LOST_TIE_ROW_NAME_FONT_SIZE_PX,
          textDecoration: "line-through",
        }}
      >
        {name}
      </span>
      {children}
    </div>
  );
}
