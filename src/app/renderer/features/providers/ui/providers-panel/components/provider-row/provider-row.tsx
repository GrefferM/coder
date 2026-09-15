import { useInteraction } from "../../../../../../hooks";
import { Dot, Mark } from "../../../../../../components";
import { INTERACTION_HOVER_BORDER_COLOR, INTERACTION_TRANSITION } from "../../../../../../constants";
import {
  PROVIDER_ROW_BACKGROUND_COLOR,
  PROVIDER_ROW_BORDER_COLOR,
  PROVIDER_ROW_BORDER_RADIUS_PX,
  PROVIDER_ROW_CHEVRON_COLOR,
  PROVIDER_ROW_CHEVRON_SIZE_PX,
  PROVIDER_ROW_DOT_COLOR,
  PROVIDER_ROW_DOT_GLOW_PX,
  PROVIDER_ROW_DOT_SIZE_PX,
  PROVIDER_ROW_EMPTY_BORDER_COLOR,
  PROVIDER_ROW_EMPTY_CHEVRON_COLOR,
  PROVIDER_ROW_EMPTY_DOT_BORDER,
  PROVIDER_ROW_EMPTY_FACTS_COLOR,
  PROVIDER_ROW_EMPTY_NAME_COLOR,
  PROVIDER_ROW_EMPTY_OPACITY,
  PROVIDER_ROW_FACTS_COLOR,
  PROVIDER_ROW_FACTS_GAP_PX,
  PROVIDER_ROW_FACTS_LETTER_SPACING_PX,
  PROVIDER_ROW_GAP_PX,
  PROVIDER_ROW_NAME_COLOR,
  PROVIDER_ROW_NAME_FONT_SIZE_PX,
  PROVIDER_ROW_NAME_FONT_WEIGHT,
  PROVIDER_ROW_OPEN_LABEL,
  PROVIDER_ROW_PADDING,
  PROVIDER_ROW_SILENT_DOT_COLOR,
} from "./constants";
import type { ProviderRowProps } from "./interfaces";
import { focusRing } from "../../../../../../utils/focus";

/** One provider row; the whole row leads in. */
export function ProviderRow({ name, facts, isFilled, isSilent, onOpen }: ProviderRowProps) {
  const { isLit, isFocused, handlers } = useInteraction();

  return (
    <button
      type="button"
      aria-label={`${PROVIDER_ROW_OPEN_LABEL} ${name}`}
      onClick={onOpen}
      {...handlers}
      className="d-flex align-items-center text-start flex-shrink-0"
      style={{
        padding: PROVIDER_ROW_PADDING,
        gap: PROVIDER_ROW_GAP_PX,
        borderRadius: PROVIDER_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${isLit ? INTERACTION_HOVER_BORDER_COLOR : isFilled ? PROVIDER_ROW_BORDER_COLOR : PROVIDER_ROW_EMPTY_BORDER_COLOR}`,
        background: isFilled ? PROVIDER_ROW_BACKGROUND_COLOR : "transparent",
        opacity: isFilled || isLit ? 1 : PROVIDER_ROW_EMPTY_OPACITY,
        cursor: "pointer",
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      <Dot
        color={isSilent ? PROVIDER_ROW_SILENT_DOT_COLOR : isFilled ? PROVIDER_ROW_DOT_COLOR : "transparent"}
        size={PROVIDER_ROW_DOT_SIZE_PX}
        glow={isFilled && !isSilent ? PROVIDER_ROW_DOT_GLOW_PX : undefined}
        border={isFilled || isSilent ? undefined : PROVIDER_ROW_EMPTY_DOT_BORDER}
        className="flex-shrink-0"
      />
      <div
        className="d-flex flex-column flex-fill"
        style={{
          gap: PROVIDER_ROW_FACTS_GAP_PX,
          minWidth: 0,
        }}
      >
        <span
          style={{
            color: isFilled ? PROVIDER_ROW_NAME_COLOR : PROVIDER_ROW_EMPTY_NAME_COLOR,
            fontSize: PROVIDER_ROW_NAME_FONT_SIZE_PX,
            fontWeight: isFilled ? PROVIDER_ROW_NAME_FONT_WEIGHT : undefined,
          }}
        >
          {name}
        </span>
        <Mark
          color={isFilled ? PROVIDER_ROW_FACTS_COLOR : PROVIDER_ROW_EMPTY_FACTS_COLOR}
          spacing={PROVIDER_ROW_FACTS_LETTER_SPACING_PX}
          isUpperCase={false}
        >
          {facts}
        </Mark>
      </div>
      <svg
        width={PROVIDER_ROW_CHEVRON_SIZE_PX}
        height={PROVIDER_ROW_CHEVRON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={isFilled ? PROVIDER_ROW_CHEVRON_COLOR : PROVIDER_ROW_EMPTY_CHEVRON_COLOR}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
