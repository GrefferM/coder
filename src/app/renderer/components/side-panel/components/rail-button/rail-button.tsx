import { useInteraction } from "../../../../hooks";
import {
  INTERACTION_PRESSED_BACKGROUND_COLOR,
  INTERACTION_PRESSED_SHIFT_PX,
  INTERACTION_TRANSITION,
} from "../../../../constants";
import { ButtonGlow } from "../../../button-glow";
import {
  COLLAPSE_LABEL,
  RAIL_BUTTON_BORDER_RADIUS_PX,
  RAIL_BUTTON_HOVER_ACTIVE_BACKGROUND_COLOR,
  RAIL_BUTTON_SIZE_PX,
  RAIL_ICON_ACTIVE_COLOR,
  RAIL_ICON_HOVER_COLOR,
  RAIL_ICON_IDLE_COLOR,
  RAIL_TOOLTIP_BACKGROUND_COLOR,
  RAIL_TOOLTIP_BORDER_COLOR,
  RAIL_TOOLTIP_BORDER_RADIUS_PX,
  RAIL_TOOLTIP_COLOR,
  RAIL_TOOLTIP_FONT_SIZE_PX,
  RAIL_TOOLTIP_GAP_PX,
  RAIL_TOOLTIP_PADDING,
} from "../../constants";
import type { DraggableStyle } from "../template/interfaces";
import type { RailButtonProps } from "./interfaces";
import { focusRing } from "../../../../utils/focus";

/** One rail button; the active item's button stays lit and is labelled «згорнути панель». */
export function RailButton({ glyph, label, isActive, side, onSelect }: RailButtonProps) {
  const { isLit, isFocused, isPressed, handlers } = useInteraction();
  const name = isActive ? COLLAPSE_LABEL : label;

  const style: DraggableStyle = {
    position: "relative",
    width: RAIL_BUTTON_SIZE_PX,
    height: RAIL_BUTTON_SIZE_PX,
    borderRadius: RAIL_BUTTON_BORDER_RADIUS_PX,
    border: "none",
    padding: 0,
    background: isPressed
      ? INTERACTION_PRESSED_BACKGROUND_COLOR
      : isActive || isLit
        ? RAIL_BUTTON_HOVER_ACTIVE_BACKGROUND_COLOR
        : "transparent",
    color: isActive ? RAIL_ICON_ACTIVE_COLOR : isLit ? RAIL_ICON_HOVER_COLOR : RAIL_ICON_IDLE_COLOR,
    cursor: "pointer",
    transform: isPressed ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
    outline: "none",
    boxShadow: focusRing(isFocused),
    transition: INTERACTION_TRANSITION,
    WebkitAppRegion: "no-drag",
  };

  return (
    <button
      type="button"
      aria-label={name}
      onClick={onSelect}
      {...handlers}
      className="d-flex align-items-center justify-content-center"
      style={style}
    >
      {glyph}
      {isLit && (
        <span
          className="text-nowrap"
          style={{
            position: "absolute",
            // The rail sits at the window's edge, so the tooltip opens inwards, over the panel.
            [side === "right" ? "right" : "left"]: RAIL_BUTTON_SIZE_PX + RAIL_TOOLTIP_GAP_PX,
            padding: RAIL_TOOLTIP_PADDING,
            borderRadius: RAIL_TOOLTIP_BORDER_RADIUS_PX,
            border: `1px solid ${RAIL_TOOLTIP_BORDER_COLOR}`,
            background: RAIL_TOOLTIP_BACKGROUND_COLOR,
            color: RAIL_TOOLTIP_COLOR,
            fontSize: RAIL_TOOLTIP_FONT_SIZE_PX,
          }}
        >
          {name}
        </span>
      )}
      <ButtonGlow
        width={RAIL_BUTTON_SIZE_PX}
        height={RAIL_BUTTON_SIZE_PX}
        borderRadius={RAIL_BUTTON_BORDER_RADIUS_PX}
        isVisible={isLit}
      />
    </button>
  );
}
