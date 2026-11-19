import { Mark } from "../../../../components";
import {
  FRESH_LABEL,
  HISTORY_LABEL,
  OPEN_MAIN_LABEL,
  SOUND_OFF_LABEL,
  SOUND_ON_LABEL,
  WIDGET_ACCENT_COLOR,
  WIDGET_FRESH_COLOR,
  WIDGET_SPEAKER_BOX_PX,
  WIDGET_SPEAKER_ROW_PADDING,
  WIDGET_SPEAKER_SIZE_PX,
  WIDGET_TOOLS_WORDS_GAP_PX,
} from "../../constants";
import type { WidgetToolsProps } from "../../interfaces";

/**
 * The row under the head: «ІСТОРІЯ», and «НОВА РОЗМОВА» once the sphere has a conversation, on the left, then the way to the whole of
 * Coder, which puts the widget away while it stands, and the speaker: lit while the ends of the walks are read aloud,
 * crossed while they are not, a press turning one into the other.
 */
export function WidgetTools({
  canBeginAgain,
  onBeginAgain,
  isHistoryOpen,
  onToggleHistory,
  isSilent,
  onToggleSilent,
  onOpenMain,
}: WidgetToolsProps) {
  return (
    <div
      className="d-flex align-items-center flex-shrink-0"
      style={{
        padding: WIDGET_SPEAKER_ROW_PADDING,
      }}
    >
      <span
        className="d-flex align-items-center flex-fill"
        style={{
          gap: WIDGET_TOOLS_WORDS_GAP_PX,
        }}
      >
        <button
          type="button"
          aria-pressed={isHistoryOpen}
          onClick={onToggleHistory}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <Mark color={isHistoryOpen ? WIDGET_ACCENT_COLOR : WIDGET_FRESH_COLOR}>{HISTORY_LABEL}</Mark>
        </button>
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
        aria-label={isSilent ? SOUND_ON_LABEL : SOUND_OFF_LABEL}
        title={isSilent ? SOUND_ON_LABEL : SOUND_OFF_LABEL}
        aria-pressed={isSilent}
        onClick={onToggleSilent}
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
          stroke={isSilent ? WIDGET_FRESH_COLOR : WIDGET_ACCENT_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          {isSilent ? (
            <path d="m16 9 6 6M22 9l-6 6" />
          ) : (
            <>
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M19 5a10 10 0 0 1 0 14" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
