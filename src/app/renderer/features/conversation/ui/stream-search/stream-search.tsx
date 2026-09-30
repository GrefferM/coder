import { useEffect, useRef } from "react";
import { useInteraction } from "../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../constants";
import { focusRing } from "../../../../utils/focus";
import { foundOfLabel } from "../../words";
import { STREAM_SEARCH_KEY, STREAM_SEARCH_LABEL, STREAM_SEARCH_PLACEHOLDER } from "../../constants";
import {
  STREAM_SEARCH_BACKGROUND_COLOR,
  STREAM_SEARCH_BORDER_COLOR,
  STREAM_SEARCH_BORDER_RADIUS_PX,
  STREAM_SEARCH_COLOR,
  STREAM_SEARCH_COUNT_COLOR,
  STREAM_SEARCH_COUNT_FONT_SIZE_PX,
  STREAM_SEARCH_COUNT_LETTER_SPACING_PX,
  STREAM_SEARCH_FONT_SIZE_PX,
  STREAM_SEARCH_GAP_PX,
  STREAM_SEARCH_ICON_COLOR,
  STREAM_SEARCH_ICON_SIZE_PX,
  STREAM_SEARCH_ICON_STROKE,
  STREAM_SEARCH_LIT_BORDER_COLOR,
  STREAM_SEARCH_PADDING,
  STREAM_SEARCH_CLEAR_ICON_SIZE_PX,
  STREAM_SEARCH_CLEAR_ICON_STROKE,
  STREAM_SEARCH_CLEAR_LABEL,
  STREAM_SEARCH_CLEAR_PATH,
  STREAM_SEARCH_STEP_GAP_PX,
  STREAM_SEARCH_STEP_DOWN_PATH,
  STREAM_SEARCH_STEP_NEXT_LABEL,
  STREAM_SEARCH_STEP_PREVIOUS_LABEL,
  STREAM_SEARCH_STEP_UP_PATH,
  STREAM_SEARCH_STRIP_PADDING,
} from "./constants";
import { Step } from "./components";
import type { StreamSearchProps } from "./interfaces";

/**
 * The stream's own search, over the same things as the history's; always shown under the band.
 *
 * The stream follows every typed letter. Enter is the next match, ⇧Enter the previous; Escape closes the field and
 * clears the marks.
 */
export function StreamSearch({
  query,
  isTyping,
  at,
  found,
  onQuery,
  onOpen,
  onClose,
  onNext,
  onPrevious,
}: StreamSearchProps) {
  const { isLit, isFocused, handlers } = useInteraction();
  const field = useRef<HTMLInputElement>(null);

  // ⌘F focuses this field, not the question field below.
  useEffect(() => {
    const press = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === STREAM_SEARCH_KEY && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpen();
      }
    };

    window.addEventListener("keydown", press);

    return () => window.removeEventListener("keydown", press);
  }, [onOpen]);

  // The hand asked for the caret, so the caret goes in.
  useEffect(() => {
    if (isTyping) {
      field.current?.focus();
    }
  }, [isTyping]);

  return (
    <div
      className="flex-shrink-0"
      style={{
        padding: STREAM_SEARCH_STRIP_PADDING,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: STREAM_SEARCH_GAP_PX,
          padding: STREAM_SEARCH_PADDING,
          borderRadius: STREAM_SEARCH_BORDER_RADIUS_PX,
          border: `1px solid ${isLit || isFocused ? STREAM_SEARCH_LIT_BORDER_COLOR : STREAM_SEARCH_BORDER_COLOR}`,
          background: STREAM_SEARCH_BACKGROUND_COLOR,
          boxShadow: focusRing(isFocused),
          transition: INTERACTION_TRANSITION,
        }}
        {...handlers}
      >
        <svg
          width={STREAM_SEARCH_ICON_SIZE_PX}
          height={STREAM_SEARCH_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={STREAM_SEARCH_ICON_COLOR}
          strokeWidth={STREAM_SEARCH_ICON_STROKE}
          strokeLinecap="round"
          className="flex-shrink-0"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
        <input
          ref={field}
          type="text"
          value={query}
          aria-label={STREAM_SEARCH_LABEL}
          placeholder={STREAM_SEARCH_PLACEHOLDER}
          onFocus={onOpen}
          onChange={(event) => onQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onClose();
            }

            if (event.key === "Enter") {
              event.preventDefault();

              if (event.shiftKey) {
                onPrevious();
              } else {
                onNext();
              }
            }
          }}
          className="flex-fill bg-transparent border-0 p-0"
          style={{
            fontSize: STREAM_SEARCH_FONT_SIZE_PX,
            color: STREAM_SEARCH_COLOR,
            outline: "none",
            minWidth: 0,
          }}
        />
        <span
          className="font-monospace flex-shrink-0"
          style={{
            color: STREAM_SEARCH_COUNT_COLOR,
            fontSize: STREAM_SEARCH_COUNT_FONT_SIZE_PX,
            letterSpacing: STREAM_SEARCH_COUNT_LETTER_SPACING_PX,
          }}
        >
          {foundOfLabel(at, found)}
        </span>
        {/* A cross of its own clears the word; shown only while there is one. */}
        {query !== "" && (
          <Step
            label={STREAM_SEARCH_CLEAR_LABEL}
            path={STREAM_SEARCH_CLEAR_PATH}
            size={STREAM_SEARCH_CLEAR_ICON_SIZE_PX}
            stroke={STREAM_SEARCH_CLEAR_ICON_STROKE}
            isSpent={false}
            onGo={onClose}
          />
        )}
        {/* Enter's walk as two arrows for pointer use. */}
        <span
          className="d-flex align-items-center flex-shrink-0"
          style={{
            gap: STREAM_SEARCH_STEP_GAP_PX,
          }}
        >
          <Step
            label={STREAM_SEARCH_STEP_NEXT_LABEL}
            path={STREAM_SEARCH_STEP_UP_PATH}
            isSpent={found === 0}
            onGo={onNext}
          />
          <Step
            label={STREAM_SEARCH_STEP_PREVIOUS_LABEL}
            path={STREAM_SEARCH_STEP_DOWN_PATH}
            isSpent={found === 0}
            onGo={onPrevious}
          />
        </span>
      </div>
    </div>
  );
}
