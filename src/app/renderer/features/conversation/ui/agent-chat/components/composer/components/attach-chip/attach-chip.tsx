import { useInteraction } from "../../../../../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../../../../../constants";
import { focusRing } from "../../../../../../../../utils/focus";
import { attachWeightLabel, attachedName } from "../../../../../../words";
import { AttachGlyph } from "../../../attach-glyph";
import {
  AGENT_CHAT_ATTACH_CHIP_BACKGROUND_COLOR,
  AGENT_CHAT_ATTACH_CHIP_BORDER_COLOR,
  AGENT_CHAT_ATTACH_CHIP_BORDER_RADIUS_PX,
  AGENT_CHAT_ATTACH_CHIP_GAP_PX,
  AGENT_CHAT_ATTACH_CHIP_PADDING,
  AGENT_CHAT_ATTACH_CLOSE_BORDER_RADIUS_PX,
  AGENT_CHAT_ATTACH_CLOSE_GLYPH_SIZE_PX,
  AGENT_CHAT_ATTACH_CLOSE_LABEL,
  AGENT_CHAT_ATTACH_CLOSE_LIT_BACKGROUND_COLOR,
  AGENT_CHAT_ATTACH_CLOSE_LIT_COLOR,
  AGENT_CHAT_ATTACH_CLOSE_REST_COLOR,
  AGENT_CHAT_ATTACH_CLOSE_SIZE_PX,
  AGENT_CHAT_ATTACH_GLYPH_COLOR,
  AGENT_CHAT_ATTACH_GLYPH_SIZE_PX,
  AGENT_CHAT_ATTACH_NAME_COLOR,
  AGENT_CHAT_ATTACH_NAME_FONT_SIZE_PX,
  AGENT_CHAT_ATTACH_WEIGHT_COLOR,
  AGENT_CHAT_ATTACH_WEIGHT_FONT_SIZE_PX,
  AGENT_CHAT_ATTACH_WEIGHT_LETTER_SPACING_PX,
} from "../../../../constants";
import type { AttachChipProps } from "./interfaces";

/** One attached file or folder, before the question goes: its icon, name, weight, and the × that takes it off. */
export function AttachChip({ attachment, onDetach }: AttachChipProps) {
  const close = useInteraction();
  const name = attachedName(attachment.name, attachment.kind);

  return (
    <span
      className="d-flex align-items-center"
      style={{
        gap: AGENT_CHAT_ATTACH_CHIP_GAP_PX,
        padding: AGENT_CHAT_ATTACH_CHIP_PADDING,
        borderRadius: AGENT_CHAT_ATTACH_CHIP_BORDER_RADIUS_PX,
        background: AGENT_CHAT_ATTACH_CHIP_BACKGROUND_COLOR,
        border: `1px solid ${AGENT_CHAT_ATTACH_CHIP_BORDER_COLOR}`,
        maxWidth: "100%",
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      <AttachGlyph
        kind={attachment.kind}
        size={AGENT_CHAT_ATTACH_GLYPH_SIZE_PX}
        color={AGENT_CHAT_ATTACH_GLYPH_COLOR}
      />
      <span
        className="font-monospace"
        style={{
          fontSize: AGENT_CHAT_ATTACH_NAME_FONT_SIZE_PX,
          color: AGENT_CHAT_ATTACH_NAME_COLOR,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {name}
      </span>
      <span
        className="font-monospace flex-shrink-0"
        style={{
          fontSize: AGENT_CHAT_ATTACH_WEIGHT_FONT_SIZE_PX,
          letterSpacing: AGENT_CHAT_ATTACH_WEIGHT_LETTER_SPACING_PX,
          color: AGENT_CHAT_ATTACH_WEIGHT_COLOR,
        }}
      >
        {attachWeightLabel(attachment.bytes)}
      </span>
      <button
        type="button"
        aria-label={`${AGENT_CHAT_ATTACH_CLOSE_LABEL} ${name}`}
        onClick={() => onDetach(attachment.path)}
        {...close.handlers}
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: AGENT_CHAT_ATTACH_CLOSE_SIZE_PX,
          height: AGENT_CHAT_ATTACH_CLOSE_SIZE_PX,
          border: "none",
          borderRadius: AGENT_CHAT_ATTACH_CLOSE_BORDER_RADIUS_PX,
          background: close.isLit ? AGENT_CHAT_ATTACH_CLOSE_LIT_BACKGROUND_COLOR : "transparent",
          cursor: "pointer",
          outline: "none",
          boxShadow: focusRing(close.isFocused),
          transition: INTERACTION_TRANSITION,
        }}
      >
        <svg
          width={AGENT_CHAT_ATTACH_CLOSE_GLYPH_SIZE_PX}
          height={AGENT_CHAT_ATTACH_CLOSE_GLYPH_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={close.isLit ? AGENT_CHAT_ATTACH_CLOSE_LIT_COLOR : AGENT_CHAT_ATTACH_CLOSE_REST_COLOR}
          strokeWidth="2.6"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </span>
  );
}
