import { useInteraction } from "../../hooks";
import {
  INTERACTION_ACCENT_COLOR,
  INTERACTION_ACCENT_HOVER_COLOR,
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_PRESSED_BACKGROUND_COLOR,
  INTERACTION_PRESSED_SHIFT_PX,
  INTERACTION_REST_BORDER_COLOR,
  INTERACTION_TRANSITION,
} from "../../constants";
import {
  CATALOGUE_ACTION_BORDER_RADIUS_PX,
  CATALOGUE_ACTION_DASHED_BORDER_COLOR,
  CATALOGUE_ACTION_FILLED_HOVER_BACKGROUND_COLOR,
  CATALOGUE_ACTION_FILLED_HOVER_BORDER_COLOR,
  CATALOGUE_ACTION_FILLED_ICON_COLOR,
  CATALOGUE_ACTION_FILLED_PADDING,
  CATALOGUE_ACTION_FILLED_PRESSED_BACKGROUND_COLOR,
  CATALOGUE_ACTION_FILLED_TEXT_COLOR,
  CATALOGUE_ACTION_FONT_SIZE_PX,
  CATALOGUE_ACTION_GAP_PX,
  CATALOGUE_ACTION_ICON_SIZE_PX,
  CATALOGUE_ACTION_OUTLINED_PADDING,
} from "./constants";
import type { CatalogueActionProps } from "./interfaces";

/** Create action — outlined in catalogue footers, filled in empty sections, dashed in forms. */
export function CatalogueAction({ label, isFilled = false, isDashed = false, onClick }: CatalogueActionProps) {
  const { isPointedAt, isPressed, handlers } = useInteraction();
  const isLit = isPointedAt && !isPressed;

  const filledBackground = isPressed
    ? CATALOGUE_ACTION_FILLED_PRESSED_BACKGROUND_COLOR
    : isLit
      ? CATALOGUE_ACTION_FILLED_HOVER_BACKGROUND_COLOR
      : INTERACTION_ACCENT_COLOR;
  // The lit fill sits inside a border one step lighter than itself.
  const filledBorder = isLit ? CATALOGUE_ACTION_FILLED_HOVER_BORDER_COLOR : filledBackground;
  const outlinedBackground = isPressed
    ? INTERACTION_PRESSED_BACKGROUND_COLOR
    : isLit
      ? INTERACTION_HOVER_BACKGROUND_COLOR
      : "transparent";
  const outlinedColor = isLit ? INTERACTION_ACCENT_HOVER_COLOR : INTERACTION_ACCENT_COLOR;

  return (
    <button
      type="button"
      onClick={onClick}
      {...handlers}
      className={`d-flex align-items-center justify-content-center${isFilled ? "" : " flex-fill"}`}
      style={{
        gap: CATALOGUE_ACTION_GAP_PX,
        padding: isFilled ? CATALOGUE_ACTION_FILLED_PADDING : CATALOGUE_ACTION_OUTLINED_PADDING,
        borderRadius: CATALOGUE_ACTION_BORDER_RADIUS_PX,
        border: `1px ${isDashed ? "dashed" : "solid"} ${
          isFilled
            ? filledBorder
            : isLit || isPressed
              ? INTERACTION_HOVER_BORDER_COLOR
              : isDashed
                ? CATALOGUE_ACTION_DASHED_BORDER_COLOR
                : INTERACTION_REST_BORDER_COLOR
        }`,
        background: isFilled ? filledBackground : outlinedBackground,
        color: isFilled ? CATALOGUE_ACTION_FILLED_TEXT_COLOR : outlinedColor,
        fontSize: CATALOGUE_ACTION_FONT_SIZE_PX,
        fontWeight: 600,
        transform: isPressed ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
        transition: INTERACTION_TRANSITION,
        cursor: "pointer",
      }}
    >
      <svg
        width={CATALOGUE_ACTION_ICON_SIZE_PX}
        height={CATALOGUE_ACTION_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={isFilled ? CATALOGUE_ACTION_FILLED_ICON_COLOR : "currentColor"}
        strokeWidth={isFilled ? 2.4 : 2}
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      {label}
    </button>
  );
}
