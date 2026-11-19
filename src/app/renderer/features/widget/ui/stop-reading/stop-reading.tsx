import {
  STOP_READING_LABEL,
  WIDGET_ACCENT_COLOR,
  WIDGET_FRESH_COLOR,
  WIDGET_SPEAKER_BOX_PX,
  WIDGET_SPEAKER_ROW_PADDING,
  WIDGET_SPEAKER_SIZE_PX,
} from "../../constants";
import type { StopReadingProps } from "../../interfaces";

/** The speaker under the head: lit while an end of a walk is read aloud, and a press silences it. */
export function StopReading({ isReading, onStop }: StopReadingProps) {
  return (
    <div
      className="d-flex justify-content-end flex-shrink-0"
      style={{
        padding: WIDGET_SPEAKER_ROW_PADDING,
      }}
    >
      <button
        type="button"
        aria-label={STOP_READING_LABEL}
        disabled={!isReading}
        onClick={onStop}
        className="d-flex align-items-center justify-content-center widget-no-drag"
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
