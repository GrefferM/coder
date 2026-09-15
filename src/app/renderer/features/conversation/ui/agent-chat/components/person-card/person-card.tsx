import { timeLabel } from "../../../../../../utils/dates";
import { Dot, FoundWords } from "../../../../../../components";
import {
  AGENT_CHAT_AGENT_GAP_PX,
  AGENT_CHAT_CARD_BACKGROUND_COLOR,
  AGENT_CHAT_CARD_PADDING,
  AGENT_CHAT_CARD_BORDER_RADIUS_PX,
  AGENT_CHAT_QUIET_FONT_SIZE_PX,
  AGENT_CHAT_QUIET_LETTER_SPACING_PX,
  AGENT_CHAT_CARD_BORDER_COLOR,
  AGENT_CHAT_TEXT_COLOR,
  AGENT_CHAT_TEXT_FONT_SIZE_PX,
  AGENT_CHAT_TEXT_LINE_HEIGHT,
  AGENT_CHAT_FOUND_EDGE,
  AGENT_CHAT_FOUND_EDGE_GONE,
  AGENT_CHAT_FOUND_FADE,
} from "../../constants";
import {
  PERSON_CARD_BAND_GAP_PX,
  PERSON_CARD_DOT_SIZE_PX,
  PERSON_CARD_HEAD_GAP_PX,
  PERSON_CARD_TIME_COLOR,
} from "./constants";
import { PERSON_COLOR, PERSON_NAME } from "../../../../../../constants";
import { DebugBand } from "../../../../../projection";
import type { PersonCardProps } from "./interfaces";

/**
 * The person's own reply, signed the way an agent's is — the sign over the card and not inside it — and with
 * no step number in it. The way into the projection stands under the text of the question.
 */
export function PersonCard({ text, at, onDebug, isFound, looked = "" }: PersonCardProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: AGENT_CHAT_AGENT_GAP_PX,
      }}
    >
      <span
        className="d-flex align-items-center font-monospace text-uppercase"
        style={{
          gap: PERSON_CARD_HEAD_GAP_PX,
          fontSize: AGENT_CHAT_QUIET_FONT_SIZE_PX,
          letterSpacing: AGENT_CHAT_QUIET_LETTER_SPACING_PX,
        }}
      >
        <Dot color={PERSON_COLOR} size={PERSON_CARD_DOT_SIZE_PX} className="flex-shrink-0" />
        <span
          style={{
            color: PERSON_COLOR,
          }}
        >
          {PERSON_NAME}
        </span>
        <span className="flex-fill" />
        <span
          style={{
            color: PERSON_CARD_TIME_COLOR,
          }}
        >
          {timeLabel(at)}
        </span>
      </span>
      <div
        className="d-flex flex-column"
        style={{
          gap: PERSON_CARD_BAND_GAP_PX,
          padding: AGENT_CHAT_CARD_PADDING,
          borderRadius: AGENT_CHAT_CARD_BORDER_RADIUS_PX,
          border: `1px solid ${AGENT_CHAT_CARD_BORDER_COLOR}`,
          // The light that says where the search stopped, and lets go a moment later.
          boxShadow: isFound === true ? AGENT_CHAT_FOUND_EDGE : AGENT_CHAT_FOUND_EDGE_GONE,
          transition: AGENT_CHAT_FOUND_FADE,
          background: AGENT_CHAT_CARD_BACKGROUND_COLOR,
        }}
      >
        <span
          style={{
            color: AGENT_CHAT_TEXT_COLOR,
            fontSize: AGENT_CHAT_TEXT_FONT_SIZE_PX,
            lineHeight: AGENT_CHAT_TEXT_LINE_HEIGHT,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            // The person's own question is theirs to take away; the marks around it are not.
            userSelect: "text",
            cursor: "text",
          }}
        >
          <FoundWords words={text} looked={looked} />
        </span>
        {/* The projection is opened from under the question, so what it shows is never in doubt. */}
        {onDebug !== null && (
          <span className="d-flex">
            <DebugBand onOpen={onDebug} />
          </span>
        )}
      </div>
    </div>
  );
}
