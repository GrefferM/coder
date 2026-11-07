import { Dot } from "../../../../../../components";
import { useElapsedSeconds, usePressable } from "../../../../../../hooks";
import {
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_TRANSITION,
} from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import { spanLabel, timeLabel } from "../../../../../../utils/dates";
import { MS_IN_SECOND } from "../../../../../../utils/dates/constants";
import { scheduleRowState, scheduleTrouble } from "../../../../logic";
import { everyLabel, nextLabel, stateLabel } from "../../../../words";
import {
  SCHEDULE_ROW_BACKGROUND_COLOR,
  SCHEDULE_ROW_BORDER_COLOR,
  SCHEDULE_ROW_BORDER_RADIUS_PX,
  SCHEDULE_ROW_CHEVRON_SIZE_PX,
  SCHEDULE_ROW_DOTS,
  SCHEDULE_ROW_DOT_SIZE_PX,
  SCHEDULE_ROW_GAP_PX,
  SCHEDULE_ROW_GONE_BACKGROUND_COLOR,
  SCHEDULE_ROW_GONE_BORDER_COLOR,
  SCHEDULE_ROW_GONE_COLOR,
  SCHEDULE_ROW_HEAD_GAP_PX,
  SCHEDULE_ROW_OUT_BORDER_COLOR,
  SCHEDULE_ROW_PADDING_PX,
  SCHEDULE_ROW_QUIET_COLOR,
  SCHEDULE_ROW_QUIET_FONT_SIZE_PX,
  SCHEDULE_ROW_QUIET_LETTER_SPACING_PX,
  SCHEDULE_ROW_SEPARATOR,
  SCHEDULE_ROW_TASK_COLOR,
  SCHEDULE_ROW_TASK_FONT_SIZE_PX,
  SCHEDULE_ROW_TASK_LINE_HEIGHT,
  SCHEDULE_ROW_TIME_COLOR,
} from "./constants";
import type { ScheduleRowProps } from "./interfaces";

/** One schedule: its state and agent, the task, then how often and, while it counts, how soon. */
export function ScheduleRow({ schedule, agents, standing, now, onOpen }: ScheduleRowProps) {
  const { isPointedAt, isFocused, handlers } = usePressable(onOpen);
  const trouble = scheduleTrouble(schedule, agents);
  const state = scheduleRowState(schedule, trouble, standing);
  const agent = agents.find((standingAgent) => standingAgent.id === schedule.agentId) ?? null;
  const outSince = standing?.outSince ?? null;
  const worked = useElapsedSeconds(outSince ?? now);
  const isGone = state === "agentGone";
  const quietColor = isGone ? SCHEDULE_ROW_GONE_COLOR : SCHEDULE_ROW_QUIET_COLOR;
  const dot = SCHEDULE_ROW_DOTS[state];
  const isLit = isPointedAt || isFocused;
  const lower = [
    schedule.everyMinutes === null ? null : everyLabel(schedule.everyMinutes),
    state === "on" && standing !== null && standing.nextAt !== null ? nextLabel(standing.nextAt, now) : null,
  ].filter((part) => part !== null);
  const restBorder = state === "out" ? SCHEDULE_ROW_OUT_BORDER_COLOR : SCHEDULE_ROW_BORDER_COLOR;

  return (
    <div
      {...handlers}
      className="d-flex flex-column"
      style={{
        gap: SCHEDULE_ROW_GAP_PX,
        padding: SCHEDULE_ROW_PADDING_PX,
        borderRadius: SCHEDULE_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${isGone ? SCHEDULE_ROW_GONE_BORDER_COLOR : isLit ? INTERACTION_HOVER_BORDER_COLOR : restBorder}`,
        background: isGone
          ? SCHEDULE_ROW_GONE_BACKGROUND_COLOR
          : isLit
            ? INTERACTION_HOVER_BACKGROUND_COLOR
            : SCHEDULE_ROW_BACKGROUND_COLOR,
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
        cursor: "pointer",
      }}
    >
      <span
        className="d-flex align-items-center font-monospace"
        style={{
          gap: SCHEDULE_ROW_HEAD_GAP_PX,
          fontSize: SCHEDULE_ROW_QUIET_FONT_SIZE_PX,
          letterSpacing: SCHEDULE_ROW_QUIET_LETTER_SPACING_PX,
        }}
      >
        <Dot
          color={dot.color}
          glow={dot.glow}
          border={dot.border}
          size={SCHEDULE_ROW_DOT_SIZE_PX}
          className="flex-shrink-0"
        />
        <span
          style={{
            color: quietColor,
          }}
        >
          {stateLabel(state, trouble)}
        </span>
        {agent !== null && (
          <span
            className="text-truncate"
            style={{
              color: agent.color,
            }}
          >
            {agent.name}
          </span>
        )}
        <span className="flex-fill" />
        {state === "out" && outSince !== null && (
          <span
            className="text-nowrap"
            style={{
              color: SCHEDULE_ROW_TIME_COLOR,
            }}
          >
            {`${timeLabel(new Date(outSince))}${SCHEDULE_ROW_SEPARATOR}${spanLabel(worked * MS_IN_SECOND)}`}
          </span>
        )}
        <svg
          width={SCHEDULE_ROW_CHEVRON_SIZE_PX}
          height={SCHEDULE_ROW_CHEVRON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={SCHEDULE_ROW_QUIET_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
      {schedule.task !== null && schedule.task.trim() !== "" && (
        <span
          style={{
            color: SCHEDULE_ROW_TASK_COLOR,
            fontSize: SCHEDULE_ROW_TASK_FONT_SIZE_PX,
            lineHeight: SCHEDULE_ROW_TASK_LINE_HEIGHT,
            textWrap: "pretty",
          }}
        >
          {schedule.task}
        </span>
      )}
      {lower.length > 0 && (
        <span
          className="font-monospace"
          style={{
            color: quietColor,
            fontSize: SCHEDULE_ROW_QUIET_FONT_SIZE_PX,
            letterSpacing: SCHEDULE_ROW_QUIET_LETTER_SPACING_PX,
          }}
        >
          {lower.join(SCHEDULE_ROW_SEPARATOR)}
        </span>
      )}
    </div>
  );
}
