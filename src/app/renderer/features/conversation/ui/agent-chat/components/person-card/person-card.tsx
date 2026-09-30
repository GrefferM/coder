import { timeLabel } from "../../../../../../utils/dates";
import { Dot, FoundWords } from "../../../../../../components";
import {
  AGENT_CHAT_AGENT_GAP_PX,
  AGENT_CHAT_ATTACHED_GLYPH_COLOR,
  AGENT_CHAT_ATTACHED_GLYPH_SIZE_PX,
  AGENT_CHAT_ATTACHED_ITEM_GAP_PX,
  AGENT_CHAT_ATTACHED_LABEL,
  AGENT_CHAT_ATTACHED_LABEL_COLOR,
  AGENT_CHAT_ATTACHED_NAME_COLOR,
  AGENT_CHAT_ATTACHED_NAME_LETTER_SPACING_PX,
  AGENT_CHAT_ATTACHED_ROW_GAP_PX,
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
import { AttachGlyph } from "../attach-glyph";
import { attachedName } from "../../../../words";
import type { PersonCardProps } from "./interfaces";

/**
 * The person's own reply, signed like an agent's (sign above the card, no step number); the way into the projection
 * sits under the text.
 */
export function PersonCard({ text, at, attached, onDebug, isFound, looked = "" }: PersonCardProps) {
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
          // Highlights where the search stopped, then fades.
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
            // The question text is selectable; the marks around it are not.
            userSelect: "text",
            cursor: "text",
          }}
        >
          <FoundWords words={text} looked={looked} />
        </span>
        {/* The way into the projection, under the question. */}
        {onDebug !== null && (
          <span className="d-flex">
            <DebugBand onOpen={onDebug} />
          </span>
        )}
      </div>
      {/* Attachments stay under the sent question as a quiet record: same file and folder marks, no ×. */}
      {attached.length > 0 && (
        <div
          className="d-flex flex-wrap align-items-center font-monospace"
          style={{
            gap: AGENT_CHAT_ATTACHED_ROW_GAP_PX,
            fontSize: AGENT_CHAT_QUIET_FONT_SIZE_PX,
            letterSpacing: AGENT_CHAT_QUIET_LETTER_SPACING_PX,
          }}
        >
          <span
            className="text-uppercase"
            style={{
              color: AGENT_CHAT_ATTACHED_LABEL_COLOR,
            }}
          >
            {AGENT_CHAT_ATTACHED_LABEL}
          </span>
          {attached.map((file, index) => (
            <span
              key={`${file.kind}-${file.name}-${index}`}
              className="d-flex align-items-center"
              style={{
                gap: AGENT_CHAT_ATTACHED_ITEM_GAP_PX,
                letterSpacing: AGENT_CHAT_ATTACHED_NAME_LETTER_SPACING_PX,
                color: AGENT_CHAT_ATTACHED_NAME_COLOR,
              }}
            >
              <AttachGlyph
                kind={file.kind}
                size={AGENT_CHAT_ATTACHED_GLYPH_SIZE_PX}
                color={AGENT_CHAT_ATTACHED_GLYPH_COLOR}
              />
              {attachedName(file.name, file.kind)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
