import { Dot } from "../../../../../../../../components";
import { INTERACTION_TRANSITION } from "../../../../../../../../constants";
import { askedStanding } from "../../../../../../logic";
import { runStateLabel, whenLabel } from "../../../../../../words";
import {
  RUN_HISTORY_FORGET_SIZE_PX,
  RUN_HISTORY_GONE_NAME_COLOR,
  RUN_HISTORY_HEAD_GAP_PX,
  RUN_HISTORY_QUIET_COLOR,
  RUN_HISTORY_QUIET_FONT_SIZE_PX,
  RUN_HISTORY_QUIET_LETTER_SPACING_PX,
  RUN_HISTORY_QUIET_LIT_COLOR,
  RUN_HISTORY_RUNNING_DOT_GLOW_PX,
  RUN_HISTORY_STATE_DOTS,
  RUN_HISTORY_STATE_DOT_SIZE_PX,
} from "../../../../constants";
import type { RunRowHeadProps } from "./interfaces";

/** A row's head: the state, the last addressee, and the hour with the work beside it. */
export function RunRowHead({ run, agents, isRunning, isRaised }: RunRowHeadProps) {
  const dot = RUN_HISTORY_STATE_DOTS[run.state];
  const asked = askedStanding(run, agents);

  return (
    <span
      className="d-flex align-items-center w-100"
      style={{
        gap: RUN_HISTORY_HEAD_GAP_PX,
      }}
    >
      {/* The state is shown twice: a dot and a word. */}
      <Dot
        color={dot.color}
        border={dot.border}
        size={RUN_HISTORY_STATE_DOT_SIZE_PX}
        glow={isRunning ? RUN_HISTORY_RUNNING_DOT_GLOW_PX : undefined}
        className="flex-shrink-0"
      />
      <span
        className="font-monospace"
        style={{
          color: RUN_HISTORY_QUIET_COLOR,
          fontSize: RUN_HISTORY_QUIET_FONT_SIZE_PX,
          letterSpacing: RUN_HISTORY_QUIET_LETTER_SPACING_PX,
        }}
      >
        {runStateLabel(run.state)}
      </span>
      {/* The agent's current name and colour; the record's name, dimmer and colourless, for a gone one. */}
      <span
        className="font-monospace text-truncate"
        style={{
          color: asked.color ?? RUN_HISTORY_GONE_NAME_COLOR,
          fontSize: RUN_HISTORY_QUIET_FONT_SIZE_PX,
          letterSpacing: RUN_HISTORY_QUIET_LETTER_SPACING_PX,
        }}
      >
        {asked.name}
      </span>
      <span
        className="flex-fill text-end font-monospace text-nowrap"
        style={{
          color: isRaised ? RUN_HISTORY_QUIET_LIT_COLOR : RUN_HISTORY_QUIET_COLOR,
          fontSize: RUN_HISTORY_QUIET_FONT_SIZE_PX,
          letterSpacing: RUN_HISTORY_QUIET_LETTER_SPACING_PX,
          transition: INTERACTION_TRANSITION,
        }}
      >
        {whenLabel(run)}
      </span>
      {/* The cross's place, reserved whether or not it shows, so the hour never moves. */}
      <span
        className="flex-shrink-0"
        style={{
          width: RUN_HISTORY_FORGET_SIZE_PX,
          height: RUN_HISTORY_FORGET_SIZE_PX,
        }}
      />
    </span>
  );
}
