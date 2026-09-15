import { useInteraction } from "../../../../../../hooks";
import { focusRing } from "../../../../../../utils/focus";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import {
  SAID_ROW_AGAIN_BORDER_COLOR,
  SAID_ROW_AGAIN_BORDER_RADIUS_PX,
  SAID_ROW_AGAIN_COLOR,
  SAID_ROW_AGAIN_FONT_SIZE_PX,
  SAID_ROW_AGAIN_GAP_PX,
  SAID_ROW_AGAIN_GLYPH_COLOR,
  SAID_ROW_AGAIN_ICON_SIZE_PX,
  SAID_ROW_AGAIN_LABEL,
  SAID_ROW_AGAIN_LETTER_SPACING_PX,
  SAID_ROW_AGAIN_LIT_COLOR,
  SAID_ROW_AGAIN_PADDING,
  SAID_ROW_COLOR,
  SAID_ROW_COLUMN_GAP_PX,
  SAID_ROW_GAP_PX,
  SAID_ROW_RULE_COLOR,
} from "./constants";
import { Mark } from "../../../../../../components";
import type { SaidRowProps } from "./interfaces";

/**
 * What the app itself says about a turn — on the rule, never in a card. The repeat stands under
 * that rule, and alone where there are no words.
 */
export function SaidRow({ words, onAskAgain = null }: SaidRowProps) {
  const again = useInteraction();
  const rule = {
    height: 0,
    borderTop: `1px solid ${SAID_ROW_RULE_COLOR}`,
  };

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{
        gap: SAID_ROW_COLUMN_GAP_PX,
      }}
    >
      {/* A card that carries its own words leaves the act alone. */}
      {words !== null && (
        <div
          className="d-flex align-items-center align-self-stretch"
          style={{
            gap: SAID_ROW_GAP_PX,
          }}
        >
          <span className="flex-fill" style={rule} />
          <Mark color={SAID_ROW_COLOR}>{words}</Mark>
          <span className="flex-fill" style={rule} />
        </div>
      )}
      {onAskAgain !== null && (
        <button
          type="button"
          onClick={onAskAgain}
          {...again.handlers}
          className="d-flex align-items-center font-monospace text-uppercase"
          style={{
            gap: SAID_ROW_AGAIN_GAP_PX,
            padding: SAID_ROW_AGAIN_PADDING,
            borderRadius: SAID_ROW_AGAIN_BORDER_RADIUS_PX,
            border: `1px solid ${SAID_ROW_AGAIN_BORDER_COLOR}`,
            background: "transparent",
            color: again.isLit ? SAID_ROW_AGAIN_LIT_COLOR : SAID_ROW_AGAIN_COLOR,
            fontSize: SAID_ROW_AGAIN_FONT_SIZE_PX,
            letterSpacing: SAID_ROW_AGAIN_LETTER_SPACING_PX,
            cursor: "pointer",
            outline: "none",
            boxShadow: focusRing(again.isFocused),
            transition: INTERACTION_TRANSITION,
          }}
        >
          <svg
            width={SAID_ROW_AGAIN_ICON_SIZE_PX}
            height={SAID_ROW_AGAIN_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={SAID_ROW_AGAIN_GLYPH_COLOR}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />
          </svg>
          {SAID_ROW_AGAIN_LABEL}
        </button>
      )}
    </div>
  );
}
