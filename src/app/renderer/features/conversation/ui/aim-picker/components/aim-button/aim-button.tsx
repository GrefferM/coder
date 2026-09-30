import { useInteraction } from "../../../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import { mixWithTransparent } from "../../../../../../utils/colors";
import {
  AIM_PICKER_ARIA_LABEL,
  AIM_PICKER_BACKGROUND_COLOR,
  AIM_PICKER_BORDER_COLOR,
  AIM_PICKER_BORDER_RADIUS_PX,
  AIM_PICKER_CHEVRON_COLOR,
  AIM_PICKER_CHEVRON_SIZE_PX,
  AIM_PICKER_DOT_GLOW_PERCENT,
  AIM_PICKER_DOT_SIZE_PX,
  AIM_PICKER_FONT_SIZE_PX,
  AIM_PICKER_GAP_PX,
  AIM_PICKER_LETTER_SPACING_PX,
  AIM_PICKER_NAME_COLOR,
  AIM_PICKER_NOBODY_COLOR,
  AIM_PICKER_NOBODY_LABEL,
  AIM_PICKER_OPEN_BORDER_COLOR,
  AIM_PICKER_PADDING,
} from "../../constants";
import type { AimButtonProps } from "./interfaces";

/** The header's press: shows the aimed agent and opens the list. */
export function AimButton({ aimed, isOpen, onPress }: AimButtonProps) {
  const { isLit, isFocused, handlers } = useInteraction();

  return (
    <button
      type="button"
      aria-label={AIM_PICKER_ARIA_LABEL}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      onClick={onPress}
      {...handlers}
      className="d-flex align-items-center font-monospace text-uppercase"
      style={{
        gap: AIM_PICKER_GAP_PX,
        padding: AIM_PICKER_PADDING,
        borderRadius: AIM_PICKER_BORDER_RADIUS_PX,
        border: `1px solid ${isOpen || isLit ? AIM_PICKER_OPEN_BORDER_COLOR : AIM_PICKER_BORDER_COLOR}`,
        background: AIM_PICKER_BACKGROUND_COLOR,
        color: aimed === null ? AIM_PICKER_NOBODY_COLOR : AIM_PICKER_NAME_COLOR,
        fontSize: AIM_PICKER_FONT_SIZE_PX,
        letterSpacing: AIM_PICKER_LETTER_SPACING_PX,
        cursor: "pointer",
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      {aimed !== null && (
        <span
          className="flex-shrink-0"
          style={{
            width: AIM_PICKER_DOT_SIZE_PX,
            height: AIM_PICKER_DOT_SIZE_PX,
            borderRadius: "50%",
            background: aimed.color,
            boxShadow: `0 0 6px ${mixWithTransparent(aimed.color, AIM_PICKER_DOT_GLOW_PERCENT)}`,
          }}
        />
      )}
      {aimed?.name ?? AIM_PICKER_NOBODY_LABEL}
      <svg
        width={AIM_PICKER_CHEVRON_SIZE_PX}
        height={AIM_PICKER_CHEVRON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={AIM_PICKER_CHEVRON_COLOR}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={isOpen ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} />
      </svg>
    </button>
  );
}
