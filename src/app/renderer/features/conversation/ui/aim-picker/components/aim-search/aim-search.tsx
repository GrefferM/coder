import {
  AIM_PICKER_NAME_COLOR,
  AIM_PICKER_ROW_BORDER_RADIUS_PX,
  AIM_PICKER_SEARCH_BACKGROUND_COLOR,
  AIM_PICKER_SEARCH_BORDER_COLOR,
  AIM_PICKER_SEARCH_FONT_SIZE_PX,
  AIM_PICKER_SEARCH_GAP_PX,
  AIM_PICKER_SEARCH_ICON_COLOR,
  AIM_PICKER_SEARCH_ICON_SIZE_PX,
  AIM_PICKER_SEARCH_MARGIN,
  AIM_PICKER_SEARCH_PADDING,
  AIM_PICKER_SEARCH_PLACEHOLDER,
} from "../../constants";
import type { AimSearchProps } from "./interfaces";

/** The search over the agents, which the list grows only when there are enough of them to hunt for one. */
export function AimSearch({ asked, onAsk, onKeyDown }: AimSearchProps) {
  return (
    <span
      className="d-flex align-items-center"
      style={{
        gap: AIM_PICKER_SEARCH_GAP_PX,
        margin: AIM_PICKER_SEARCH_MARGIN,
        padding: AIM_PICKER_SEARCH_PADDING,
        borderRadius: AIM_PICKER_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${AIM_PICKER_SEARCH_BORDER_COLOR}`,
        background: AIM_PICKER_SEARCH_BACKGROUND_COLOR,
      }}
    >
      <svg
        width={AIM_PICKER_SEARCH_ICON_SIZE_PX}
        height={AIM_PICKER_SEARCH_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={AIM_PICKER_SEARCH_ICON_COLOR}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </svg>
      <input
        spellCheck={false}
        autoFocus
        value={asked}
        aria-label={AIM_PICKER_SEARCH_PLACEHOLDER}
        placeholder={AIM_PICKER_SEARCH_PLACEHOLDER}
        onChange={(event) => onAsk(event.target.value)}
        onKeyDown={onKeyDown}
        className="flex-fill"
        style={{
          border: "none",
          background: "transparent",
          color: AIM_PICKER_NAME_COLOR,
          fontSize: AIM_PICKER_SEARCH_FONT_SIZE_PX,
          outline: "none",
          minWidth: 0,
        }}
      />
    </span>
  );
}
