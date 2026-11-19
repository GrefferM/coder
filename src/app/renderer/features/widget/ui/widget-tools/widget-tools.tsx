import { Mark } from "../../../../components";
import {
  FRESH_LABEL,
  OPEN_MAIN_LABEL,
  STOP_READING_LABEL,
  WIDGET_ACCENT_COLOR,
  WIDGET_FRESH_COLOR,
  WIDGET_SPEAKER_BOX_PX,
  WIDGET_SPEAKER_ROW_PADDING,
  WIDGET_SPEAKER_SIZE_PX,
} from "../../constants";
import type { WidgetToolsProps } from "../../interfaces";

/**
 * The row under the head: «НОВА РОЗМОВА» on the left once the sphere has a conversation, then the way to the whole of
 * Coder, which puts the widget away while it stands, and the speaker,
 * lit while an end of a walk is read aloud, whose press silences that reading.
 */
export function WidgetTools({ canBeginAgain, onBeginAgain, isReading, onStopReading, onOpenMain }: WidgetToolsProps) {
  return (
    <div
      className="d-flex align-items-center flex-shrink-0"
      style={{
        padding: WIDGET_SPEAKER_ROW_PADDING,
      }}
    >
      <span className="flex-fill">
        {canBeginAgain && (
          <button
            type="button"
            onClick={onBeginAgain}

            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <Mark color={WIDGET_FRESH_COLOR}>{FRESH_LABEL}</Mark>
          </button>
        )}
      </span>
      <button
        type="button"
        aria-label={OPEN_MAIN_LABEL}
        title={OPEN_MAIN_LABEL}
        onClick={onOpenMain}
        className="d-flex align-items-center justify-content-center"
        style={{
          width: WIDGET_SPEAKER_BOX_PX,
          height: WIDGET_SPEAKER_BOX_PX,
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <svg
          width={WIDGET_SPEAKER_SIZE_PX}
          height={WIDGET_SPEAKER_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={WIDGET_FRESH_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={STOP_READING_LABEL}
        title={STOP_READING_LABEL}
        disabled={!isReading}
        onClick={onStopReading}
        className="d-flex align-items-center justify-content-center"
        style={{
          width: WIDGET_SPEAKER_BOX_PX,
          height: WIDGET_SPEAKER_BOX_PX,
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: isReading ? "pointer" : "default",
        }}
      >
        <svg
          width={WIDGET_SPEAKER_SIZE_PX}
          height={WIDGET_SPEAKER_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isReading ? WIDGET_ACCENT_COLOR : WIDGET_FRESH_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 5a10 10 0 0 1 0 14" />
        </svg>
      </button>
    </div>
  );
}
