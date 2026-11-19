import { Mark } from "../../../../components";
import { timeLabel } from "../../../../utils/dates";
import { TextCard } from "../text-card";
import { AloudButton } from "../../../speech";
import {
  STEP_LABEL,
  STEP_SEPARATOR,
  WIDGET_BLOCK_GAP_PX,
  WIDGET_FAILURE_COLOR,
  WIDGET_HEAD_ROW_GAP_PX,
  WIDGET_PERSON_COLOR,
  WIDGET_STEP_GAP_PX,
  WIDGET_STEP_NOTE_COLOR,
  WIDGET_STEP_NOTE_LETTER_SPACING_PX,
  WIDGET_STEP_TEXT_COLOR,
  WIDGET_TEXT_FONT_SIZE_PX,
  WIDGET_TEXT_LINE_HEIGHT,
} from "../../constants";
import type { StepBlockProps } from "../../interfaces";

/** One answer: an end of the walk whole on its card, a step between as one line, a speaker at its head's end. */
export function StepBlock({ step, agent, aloud }: StepBlockProps) {
  const color = step.isFailure ? WIDGET_FAILURE_COLOR : step.isEnd ? WIDGET_PERSON_COLOR : WIDGET_STEP_TEXT_COLOR;

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: step.isEnd ? WIDGET_BLOCK_GAP_PX : WIDGET_STEP_GAP_PX,
      }}
    >
      <span
        className="d-flex align-items-center"
        style={{
          gap: WIDGET_HEAD_ROW_GAP_PX,
        }}
      >
        <Mark color={agent?.color} className="flex-fill">
          {agent?.name ?? ""}
        </Mark>
        <Mark color={WIDGET_STEP_NOTE_COLOR} spacing={WIDGET_STEP_NOTE_LETTER_SPACING_PX}>
          {`${STEP_LABEL}${step.number}${STEP_SEPARATOR}${timeLabel(new Date(step.at))}`}
        </Mark>
        {aloud !== null && <AloudButton aloud={aloud} />}
      </span>
      {step.isEnd ? (
        <TextCard text={step.text} color={color} />
      ) : (
        <span
          className="text-truncate"
          style={{
            color,
            fontSize: WIDGET_TEXT_FONT_SIZE_PX,
            lineHeight: WIDGET_TEXT_LINE_HEIGHT,
          }}
        >
          {step.text}
        </span>
      )}
    </div>
  );
}
