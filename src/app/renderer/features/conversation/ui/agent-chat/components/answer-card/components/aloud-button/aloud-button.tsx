import { Mark } from "../../../../../../../../components";
import { useInteraction } from "../../../../../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../../../../../constants";
import { focusRing } from "../../../../../../../../utils/focus";
import { READ_ALOUD_LABEL, READ_STOP_LABEL, READING_LABEL } from "../../../../../../../speech";
import { ALOUD_GAP_PX, ALOUD_ICON_SIZE_PX, ALOUD_LIT_COLOR, ALOUD_READING_COLOR, ALOUD_REST_COLOR } from "./constants";
import type { AloudButtonProps } from "./interfaces";

/** The speaker over an answer: reads it aloud, or, while it reads, says «ЧИТАЄ» beside a stop square. */
export function AloudButton({ aloud }: AloudButtonProps) {
  const press = useInteraction();
  const color = aloud.isReading ? ALOUD_READING_COLOR : press.isLit ? ALOUD_LIT_COLOR : ALOUD_REST_COLOR;

  return (
    <span
      className="d-flex align-items-center flex-shrink-0"
      style={{
        gap: ALOUD_GAP_PX,
      }}
    >
      {aloud.isReading && <Mark color={ALOUD_READING_COLOR}>{READING_LABEL}</Mark>}
      <button
        type="button"
        aria-label={aloud.isReading ? READ_STOP_LABEL : READ_ALOUD_LABEL}
        aria-pressed={aloud.isReading}
        onClick={aloud.onPress}
        {...press.handlers}
        className="d-flex align-items-center justify-content-center"
        style={{
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          outline: "none",
          boxShadow: focusRing(press.isFocused),
          transition: INTERACTION_TRANSITION,
        }}
      >
        {aloud.isReading ? (
          <svg
            width={ALOUD_ICON_SIZE_PX}
            height={ALOUD_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg
            width={ALOUD_ICON_SIZE_PX}
            height={ALOUD_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5 6 9H2v6h4l5 4V5Z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 5a10 10 0 0 1 0 14" />
          </svg>
        )}
      </button>
    </span>
  );
}
