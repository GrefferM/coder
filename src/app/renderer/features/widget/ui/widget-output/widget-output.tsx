import { Fragment } from "react";
import { Mark } from "../../../../components";
import { useStayAtBottom } from "../../../../hooks";
import { timeLabel } from "../../../../utils/dates";
import { StepBlock } from "../step-block";
import { TextCard } from "../text-card";
import { WorkingCard } from "../working-card";
import {
  PERSON_LABEL,
  WIDGET_BLOCK_GAP_PX,
  WIDGET_OUTPUT_GAP_PX,
  WIDGET_OUTPUT_PADDING,
  WIDGET_PERSON_COLOR,
  WIDGET_PERSON_DOT_PX,
  WIDGET_PERSON_HEAD_GAP_PX,
  WIDGET_TIME_COLOR,
} from "../../constants";
import type { Agent } from "../../../../interfaces";
import type { WidgetOutputProps, WidgetStep } from "../../interfaces";
import type { CardAloud } from "../../../speech";

/**
 * The chosen sphere's conversation (52e, 52k), newest at the bottom: each question on its «ВИ» card, the steps between
 * as one line each, the turns out as working cards, and an end of the walk whole on its card. Empty, it says nothing.
 */
export function WidgetOutput({ exchanges, agents, aloud }: WidgetOutputProps) {
  const { box } = useStayAtBottom<HTMLDivElement>(exchanges[0]?.questionId ?? null);
  const agentOf = (agentId: string): Agent | null => agents.find((agent) => agent.id === agentId) ?? null;
  /** The speaker over an answer, by the answer's own id; a failure or an answer with no words has none. */
  const aloudOf = (step: WidgetStep): CardAloud | null => {
    if (step.isFailure || step.text === "") {
      return null;
    }

    const isReading = aloud.readingId === step.id;

    return {
      isReading,
      spoken: isReading ? aloud.spoken : null,
      onPress: () => (isReading ? aloud.stop() : aloud.read(step.id, step.text)),
    };
  };

  return (
    <div
      ref={box}
      className="d-flex flex-column flex-fill"
      style={{
        padding: WIDGET_OUTPUT_PADDING,
        gap: WIDGET_OUTPUT_GAP_PX,
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      {/* The first block is pushed down, so a short conversation stands at the bottom. */}
      <span className="mt-auto" />
      {exchanges.map((exchange) => (
        <Fragment key={exchange.questionId}>
          <div
            className="d-flex flex-column"
            style={{
              gap: WIDGET_BLOCK_GAP_PX,
            }}
          >
            <span
              className="d-flex align-items-center"
              style={{
                gap: WIDGET_PERSON_HEAD_GAP_PX,
              }}
            >
              <span
                style={{
                  width: WIDGET_PERSON_DOT_PX,
                  height: WIDGET_PERSON_DOT_PX,
                  borderRadius: "50%",
                  background: WIDGET_PERSON_COLOR,
                }}
              />
              <Mark color={WIDGET_PERSON_COLOR} className="flex-fill">
                {PERSON_LABEL}
              </Mark>
              <Mark color={WIDGET_TIME_COLOR} spacing={0}>
                {timeLabel(new Date(exchange.question.at))}
              </Mark>
            </span>
            <TextCard text={exchange.question.text} color={WIDGET_PERSON_COLOR} />
          </div>
          {exchange.steps.map((step) => (
            <StepBlock key={step.id} step={step} agent={agentOf(step.agentId)} aloud={aloudOf(step)} />
          ))}
          {exchange.working.map((turn) => (
            <div
              key={turn.turnId}
              className="d-flex flex-column"
              style={{
                gap: WIDGET_BLOCK_GAP_PX,
              }}
            >
              <Mark color={agentOf(turn.agentId)?.color}>{agentOf(turn.agentId)?.name ?? ""}</Mark>
              <WorkingCard color={agentOf(turn.agentId)?.color ?? WIDGET_PERSON_COLOR} startedAt={turn.startedAt} />
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
