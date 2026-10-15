import { useInteraction } from "../../../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import {
  RUN_SEARCH_BACKGROUND_COLOR,
  RUN_SEARCH_BORDER_COLOR,
  RUN_SEARCH_BORDER_RADIUS_PX,
  RUN_SEARCH_COLOR,
  RUN_SEARCH_COUNT_COLOR,
  RUN_SEARCH_FONT_SIZE_PX,
  RUN_SEARCH_GAP_PX,
  RUN_SEARCH_ICON_COLOR,
  RUN_SEARCH_ICON_SIZE_PX,
  RUN_SEARCH_ICON_STROKE,
  RUN_SEARCH_LABEL,
  RUN_SEARCH_LIT_BORDER_COLOR,
  RUN_SEARCH_PADDING,
  RUN_SEARCH_PLACEHOLDER,
  RUN_HISTORY_QUIET_FONT_SIZE_PX,
  RUN_HISTORY_QUIET_LETTER_SPACING_PX,
} from "../../constants";
import { foundCount } from "../../../../words";
import { Clear } from "./components";
import type { RunSearchProps } from "./interfaces";

/**
 * The one search over the record, above the list. The count stands inside the field: «142» at rest, «40 МІСЦЬ · 3
 * ЗАПУСКИ» with a word.
 */
export function RunSearch({ query, record, places, runs, onQuery }: RunSearchProps) {
  const { isLit, isFocused, handlers } = useInteraction();

  return (
    <div
      className="d-flex align-items-center flex-shrink-0"
      style={{
        gap: RUN_SEARCH_GAP_PX,
        padding: RUN_SEARCH_PADDING,
        borderRadius: RUN_SEARCH_BORDER_RADIUS_PX,
        border: `1px solid ${isLit || isFocused ? RUN_SEARCH_LIT_BORDER_COLOR : RUN_SEARCH_BORDER_COLOR}`,
        background: RUN_SEARCH_BACKGROUND_COLOR,
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
      {...handlers}
    >
      <svg
        width={RUN_SEARCH_ICON_SIZE_PX}
        height={RUN_SEARCH_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={RUN_SEARCH_ICON_COLOR}
        strokeWidth={RUN_SEARCH_ICON_STROKE}
        strokeLinecap="round"
        className="flex-shrink-0"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </svg>
      <input
        type="text"
        value={query}
        aria-label={RUN_SEARCH_LABEL}
        placeholder={RUN_SEARCH_PLACEHOLDER}
        onChange={(event) => onQuery(event.target.value)}
        className="flex-fill bg-transparent border-0 p-0"
        style={{
          fontSize: RUN_SEARCH_FONT_SIZE_PX,
          color: RUN_SEARCH_COLOR,
          outline: "none",
          minWidth: 0,
        }}
      />
      <span
        className="font-monospace flex-shrink-0"
        style={{
          color: RUN_SEARCH_COUNT_COLOR,
          fontSize: RUN_HISTORY_QUIET_FONT_SIZE_PX,
          letterSpacing: RUN_HISTORY_QUIET_LETTER_SPACING_PX,
        }}
      >
        {foundCount(query, places, runs, record)}
      </span>
      {query !== "" && <Clear onClear={() => onQuery("")} />}
    </div>
  );
}
