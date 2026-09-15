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

/**
 * The head of a row — a dot, the word of state, the quiet name of whom the flow was asked
 * last, and the hour with the work beside it. The name is the one the person addressed, not the first agent to walk:
 * many agents work inside one flow, and the head answers «with whom», while the state answers «whether to read on».
 * The name wears the agent's own colour: a row of grey words says who worked in it only to whoever reads them all,
 * and the colour is the one thing a person already knows their agents by. It stands from the moment of the
 * question, because the record keeps the addressee beside the question and not beside the first
 * step; an agent the project has let go has no colour left to wear, and is drawn quiet for that.
 */
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
      {/* The state is said twice on one line — a dot, and the word beside it. */}
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
      {/* Today's name in today's colour, and the record's — dimmer, colourless — for one who is gone. */}
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
      {/* The cross's own place, held whether it is there or not, so the hour never moves. */}
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
