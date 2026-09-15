import { moneyLabel, tokensLabel, wholeMoneyLabel, wholeTokensLabel } from "../../../../../../utils/numbers";
import { WorkingDots } from "../../../../../../components";
import { shortLabel } from "../../../../../../utils/text";
import { FoundWords } from "../../../../../../components";
import { timeLabel } from "../../../../../../utils/dates";
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
  ANSWER_CARD_CEILING_LABEL,
  ANSWER_CARD_DOT_SIZE_PX,
  ANSWER_CARD_FACT_COLOR,
  ANSWER_CARD_FACT_LETTER_SPACING_PX,
  ANSWER_CARD_FACT_SEPARATOR,
  ANSWER_CARD_HEAD_GAP_PX,
  ANSWER_CARD_NAME_LETTERS_MOST,
  ANSWER_CARD_STEP_COLOR,
  ANSWER_CARD_STEP_DOT_SIZE_PX,
  ANSWER_CARD_STEP_FONT_SIZE_PX,
  ANSWER_CARD_STEP_HEAD_GAP_PX,
  ANSWER_CARD_STEP_LETTER_SPACING_PX,
  ANSWER_CARD_STEP_PREFIX,
} from "./constants";
import type { AnswerCardProps } from "./interfaces";

/** An agent answer — streaming or complete; cost is known only after the stream ends. */
export function AnswerCard({
  agentName,
  agentColor,
  text,
  cost,
  answerCeiling = null,
  isCounting,
  step = null,
  isFound,
  looked = "",
}: AnswerCardProps) {
  // What the counts are to be read against, where the turn ran under a ceiling at all.
  const ceiling =
    answerCeiling === null ? "" : `${ANSWER_CARD_FACT_SEPARATOR}${ANSWER_CARD_CEILING_LABEL}${answerCeiling}`;

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: AGENT_CHAT_AGENT_GAP_PX,
      }}
    >
      <span
        className="d-flex align-items-center flex-wrap font-monospace text-uppercase"
        style={{
          gap: step === null ? ANSWER_CARD_HEAD_GAP_PX : ANSWER_CARD_STEP_HEAD_GAP_PX,
          fontSize: AGENT_CHAT_QUIET_FONT_SIZE_PX,
          letterSpacing: AGENT_CHAT_QUIET_LETTER_SPACING_PX,
        }}
      >
        {step !== null && (
          <span
            className="flex-shrink-0"
            style={{
              width: ANSWER_CARD_STEP_DOT_SIZE_PX,
              height: ANSWER_CARD_STEP_DOT_SIZE_PX,
              borderRadius: "50%",
              background: agentColor,
            }}
          />
        )}
        <span
          className="text-nowrap"
          title={agentName}
          style={{
            color: agentColor,
          }}
        >
          {shortLabel(agentName, ANSWER_CARD_NAME_LETTERS_MOST)}
        </span>
        {isCounting && (
          <span
            className="d-flex align-items-center"
            style={{
              color: ANSWER_CARD_FACT_COLOR,
              letterSpacing: ANSWER_CARD_FACT_LETTER_SPACING_PX,
            }}
          >
            {ANSWER_CARD_FACT_SEPARATOR}
            <WorkingDots color={ANSWER_CARD_FACT_COLOR} size={ANSWER_CARD_DOT_SIZE_PX} />
          </span>
        )}
        {!isCounting && cost !== null && (
          <span
            className="text-nowrap"
            title={`${wholeTokensLabel(cost.inputTokens, cost.outputTokens)}${ceiling}${ANSWER_CARD_FACT_SEPARATOR}${wholeMoneyLabel(cost.money)}`}
            style={{
              color: ANSWER_CARD_FACT_COLOR,
              letterSpacing: ANSWER_CARD_FACT_LETTER_SPACING_PX,
            }}
          >
            {`${ANSWER_CARD_FACT_SEPARATOR}${tokensLabel(cost.inputTokens, cost.outputTokens)}${ANSWER_CARD_FACT_SEPARATOR}${moneyLabel(cost.money)}`}
          </span>
        )}
        {/*
         * A plain gap holds the step at the far end, not a hairline — the hairline repeated the handoff rule
         * two rows up. A panel too narrow for the whole line drops the step to a line of its own, still at that end,
         * rather than breaking a count or a price in half.
         */}
        {step !== null && (
          <span
            className="ms-auto text-nowrap"
            style={{
              color: ANSWER_CARD_STEP_COLOR,
              fontSize: ANSWER_CARD_STEP_FONT_SIZE_PX,
              letterSpacing: ANSWER_CARD_STEP_LETTER_SPACING_PX,
            }}
          >
            {`${ANSWER_CARD_STEP_PREFIX}${step.level}${ANSWER_CARD_FACT_SEPARATOR}${timeLabel(new Date(step.at))}`}
          </span>
        )}
      </span>
      <span
        style={{
          padding: AGENT_CHAT_CARD_PADDING,
          borderRadius: AGENT_CHAT_CARD_BORDER_RADIUS_PX,
          border: `1px solid ${AGENT_CHAT_CARD_BORDER_COLOR}`,
          // The light that says where the search stopped, and lets go a moment later.
          boxShadow: isFound === true ? AGENT_CHAT_FOUND_EDGE : AGENT_CHAT_FOUND_EDGE_GONE,
          transition: AGENT_CHAT_FOUND_FADE,
          background: AGENT_CHAT_CARD_BACKGROUND_COLOR,
          color: AGENT_CHAT_TEXT_COLOR,
          fontSize: AGENT_CHAT_TEXT_FONT_SIZE_PX,
          lineHeight: AGENT_CHAT_TEXT_LINE_HEIGHT,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          // The model's own words are the one thing worth taking away, so selection lives here alone.
          userSelect: "text",
          cursor: "text",
        }}
      >
        <FoundWords words={text} looked={looked} />
      </span>
    </div>
  );
}
