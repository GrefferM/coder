import {
  SWITCHER_ACTION_FONT_SIZE_PX,
  SWITCHER_BUTTON_BACKGROUND_COLOR,
  SWITCHER_BUTTON_BORDER_COLOR,
  SWITCHER_BUTTON_BORDER_RADIUS_PX,
  SWITCHER_BUTTON_GAP_PX,
  SWITCHER_BUTTON_PADDING,
  SWITCHER_BUTTON_PATH_COLOR,
  SWITCHER_BUTTON_PATH_LETTER_SPACING_PX,
  SWITCHER_BUTTON_WIDTH_PX,
  SWITCHER_NAME_COLOR,
  SWITCHER_NAME_FONT_SIZE_PX,
  SWITCHER_NAME_FONT_WEIGHT,
} from "../../constants";
import { Mark } from "../../../../../../components";
import type { SwitcherButtonProps } from "./interfaces";

/** The open project: its name, location, and the way to the rest. */
export function SwitcherButton({ name, directory, isOpen, onPress }: SwitcherButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-label={name}
      onClick={onPress}
      className="d-flex align-items-center"
      style={{
        width: SWITCHER_BUTTON_WIDTH_PX,
        padding: SWITCHER_BUTTON_PADDING,
        gap: SWITCHER_BUTTON_GAP_PX,
        borderRadius: SWITCHER_BUTTON_BORDER_RADIUS_PX,
        border: `1px solid ${SWITCHER_BUTTON_BORDER_COLOR}`,
        background: SWITCHER_BUTTON_BACKGROUND_COLOR,
        cursor: "pointer",
      }}
    >
      <span
        className="d-flex flex-column align-items-start flex-fill"
        style={{
          gap: 2,
          minWidth: 0,
        }}
      >
        <span
          className="text-truncate w-100 text-start"
          style={{
            fontSize: SWITCHER_NAME_FONT_SIZE_PX,
            fontWeight: SWITCHER_NAME_FONT_WEIGHT,
            color: SWITCHER_NAME_COLOR,
          }}
        >
          {name}
        </span>
        <Mark
          color={SWITCHER_BUTTON_PATH_COLOR}
          spacing={SWITCHER_BUTTON_PATH_LETTER_SPACING_PX}
          isUpperCase={false}
          className="text-truncate w-100 text-start"
        >
          {directory}
        </Mark>
      </span>
      <span
        style={{
          color: SWITCHER_BUTTON_PATH_COLOR,
          fontSize: SWITCHER_ACTION_FONT_SIZE_PX,
        }}
      >
        {isOpen ? "⌃" : "⌄"}
      </span>
    </button>
  );
}
