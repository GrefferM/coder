import { Chip } from "../../../../../../../../../../components";
import { useInteraction } from "../../../../../../../../../../hooks";
import {
  INTERACTION_ACCENT_COLOR,
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_REST_BACKGROUND_COLOR,
  INTERACTION_REST_BORDER_COLOR,
  INTERACTION_TRANSITION,
} from "../../../../../../../../../../constants";
import {
  TOOL_ROW_OPEN_LABEL,
  TOOL_ROW_PINNED_BACKGROUND_COLOR,
  TOOL_ROW_PINNED_GAP_PX,
  TOOL_ROW_PINNED_ICON_SIZE_PX,
} from "./constants";
import {
  SETTINGS_ROW_BORDER_RADIUS_PX,
  SETTINGS_ROW_CHEVRON_COLOR,
  SETTINGS_ROW_CHEVRON_SIZE_PX,
  SETTINGS_ROW_GAP_PX,
  SETTINGS_ROW_NAME_COLOR,
  SETTINGS_ROW_NAME_FONT_SIZE_PX,
  SETTINGS_ROW_PADDING,
} from "../../../../constants";
import type { ToolRowProps } from "./interfaces";
import { focusRing } from "../../../../../../../../../../utils/focus";

/** One held function under the field; the whole row opens the grant, revoking is the list's tick. */
export function ToolRow({ name, pinnedCount, onOpen }: ToolRowProps) {
  const { isLit, isFocused, handlers } = useInteraction();

  return (
    <button
      type="button"
      aria-label={`${TOOL_ROW_OPEN_LABEL} ${name}`}
      onClick={onOpen}
      {...handlers}
      className="d-flex align-items-center text-start"
      style={{
        padding: SETTINGS_ROW_PADDING,
        gap: SETTINGS_ROW_GAP_PX,
        borderRadius: SETTINGS_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${isLit ? INTERACTION_HOVER_BORDER_COLOR : INTERACTION_REST_BORDER_COLOR}`,
        background: INTERACTION_REST_BACKGROUND_COLOR,
        cursor: "pointer",
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      <span
        className="font-monospace flex-fill text-truncate"
        style={{
          color: SETTINGS_ROW_NAME_COLOR,
          fontSize: SETTINGS_ROW_NAME_FONT_SIZE_PX,
        }}
      >
        {name}
      </span>
      {pinnedCount > 0 && (
        <Chip
          color={INTERACTION_ACCENT_COLOR}
          background={TOOL_ROW_PINNED_BACKGROUND_COLOR}
          gap={TOOL_ROW_PINNED_GAP_PX}
        >
          <svg
            width={TOOL_ROW_PINNED_ICON_SIZE_PX}
            height={TOOL_ROW_PINNED_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={INTERACTION_ACCENT_COLOR}
            strokeWidth="2.4"
          >
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          {pinnedCount}
        </Chip>
      )}
      <svg
        width={SETTINGS_ROW_CHEVRON_SIZE_PX}
        height={SETTINGS_ROW_CHEVRON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={SETTINGS_ROW_CHEVRON_COLOR}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}
