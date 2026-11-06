import { Mark } from "../../../../../../components";
import {
  SPEECH_CARD_BACKGROUND_COLOR,
  SPEECH_CARD_BORDER_COLOR,
  SPEECH_CARD_BORDER_RADIUS_PX,
  SPEECH_CARD_GAP_PX,
  SPEECH_CARD_NOTE_COLOR,
  SPEECH_CARD_PADDING,
  SPEECH_CARD_TITLE_COLOR,
  SPEECH_CARD_TITLE_FONT_SIZE_PX,
  SPEECH_CARD_TITLE_FONT_WEIGHT,
} from "../../constants";
import type { SpeechCardProps } from "./interfaces";

/** One card of the speech section: its title and a note beside it, then its fields. */
export function SpeechCard({ title, note, children }: SpeechCardProps) {
  return (
    <div
      className="d-flex flex-column flex-shrink-0"
      style={{
        padding: SPEECH_CARD_PADDING,
        gap: SPEECH_CARD_GAP_PX,
        borderRadius: SPEECH_CARD_BORDER_RADIUS_PX,
        border: `1px solid ${SPEECH_CARD_BORDER_COLOR}`,
        background: SPEECH_CARD_BACKGROUND_COLOR,
      }}
    >
      <span className="d-flex align-items-center">
        <span
          className="flex-fill"
          style={{
            color: SPEECH_CARD_TITLE_COLOR,
            fontSize: SPEECH_CARD_TITLE_FONT_SIZE_PX,
            fontWeight: SPEECH_CARD_TITLE_FONT_WEIGHT,
          }}
        >
          {title}
        </span>
        {note !== undefined && <Mark color={SPEECH_CARD_NOTE_COLOR}>{note}</Mark>}
      </span>
      {children}
    </div>
  );
}
