import { RUN_HISTORY_SEPARATOR } from "../../../../constants";
import { useInteraction } from "../../../../../../hooks";
import { Mark, useHint } from "../../../../../../components";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import { moneyLabel } from "../../../../../../utils/numbers";
import { startedLabel, stepsLabel } from "../../../../words";
import { RUN_NOT_SENT, RUN_RUNNING } from "../../../../constants";
import {
  RUN_HISTORY_ASKED_COLOR,
  RUN_HISTORY_ASKED_FONT_SIZE_PX,
  RUN_HISTORY_ASKED_LINES,
  RUN_HISTORY_ASKED_LINE_HEIGHT,
  RUN_HISTORY_NO_MONEY_LABEL,
  RUN_HISTORY_OPEN_HINT,
  RUN_HISTORY_QUIET_COLOR,
  RUN_HISTORY_QUIET_LETTER_SPACING_PX,
  RUN_HISTORY_ROW_BACKGROUND_COLOR,
  RUN_HISTORY_ROW_BORDER_COLOR,
  RUN_HISTORY_ROW_BORDER_RADIUS_PX,
  RUN_HISTORY_ROW_GAP_PX,
  RUN_HISTORY_ROW_LIT_BACKGROUND_COLOR,
  RUN_HISTORY_ROW_LIT_BORDER_COLOR,
  RUN_HISTORY_ROW_PADDING,
  RUN_HISTORY_RUNNING_BORDER_COLOR,
} from "../../constants";
import { ForgetCross, RunRowHead } from "./components";
import type { RunRowLineProps } from "./interfaces";

/** One run: a heading with what was asked, and the press that opens it in the stream. */
export function RunRowLine({ run, agents, now, onOpen, onForget }: RunRowLineProps) {
  const { isLit, isFocused, handlers } = useInteraction();
  // The hint shows in the app's own window, not the browser `title`.
  const said = useHint<HTMLButtonElement>(RUN_HISTORY_OPEN_HINT, isLit, isFocused);
  const forget = useInteraction();
  const started = startedLabel(run, now);
  const isRunning = run.state === RUN_RUNNING;
  // One step is not counted, except when nothing was sent: that row is the record's only line of a question that
  // reached nobody.
  const countsSteps = run.steps > 1 || run.state === RUN_NOT_SENT;
  // The cross is outside the row, so either one under the pointer raises the row.
  const isRaised = isLit || forget.isLit || forget.isFocused;

  return (
    <div className="position-relative d-flex">
      <button
        ref={said.ref}
        type="button"
        aria-label={RUN_HISTORY_OPEN_HINT}
        onClick={onOpen}
        {...handlers}
        className="d-flex flex-column w-100 text-start"
        style={{
          gap: RUN_HISTORY_ROW_GAP_PX,
          padding: RUN_HISTORY_ROW_PADDING,
          borderRadius: RUN_HISTORY_ROW_BORDER_RADIUS_PX,
          border: `1px solid ${
            isRaised
              ? RUN_HISTORY_ROW_LIT_BORDER_COLOR
              : isRunning
                ? RUN_HISTORY_RUNNING_BORDER_COLOR
                : RUN_HISTORY_ROW_BORDER_COLOR
          }`,
          background: isRaised ? RUN_HISTORY_ROW_LIT_BACKGROUND_COLOR : RUN_HISTORY_ROW_BACKGROUND_COLOR,
          cursor: "pointer",
          outline: "none",
          boxShadow: focusRing(isFocused),
          transition: INTERACTION_TRANSITION,
        }}
      >
        <RunRowHead run={run} agents={agents} isRunning={isRunning} isRaised={isRaised} />
        <span
          style={{
            display: "-webkit-box",
            WebkitLineClamp: RUN_HISTORY_ASKED_LINES,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            color: RUN_HISTORY_ASKED_COLOR,
            fontSize: RUN_HISTORY_ASKED_FONT_SIZE_PX,
            lineHeight: RUN_HISTORY_ASKED_LINE_HEIGHT,
            overflowWrap: "anywhere",
          }}
        >
          {run.asked}
        </span>
        <Mark color={RUN_HISTORY_QUIET_COLOR} spacing={RUN_HISTORY_QUIET_LETTER_SPACING_PX} isUpperCase={false}>
          {countsSteps ? `${stepsLabel(run.steps)}${RUN_HISTORY_SEPARATOR}` : ""}
          {run.money === null ? RUN_HISTORY_NO_MONEY_LABEL : moneyLabel(run.money)}
          {started === null ? "" : `${RUN_HISTORY_SEPARATOR}${started}`}
        </Mark>
        {said.hint}
      </button>
      {/* Beside the row, not inside it, so opening and deleting are separate presses. */}
      {/* A running run has no delete, as its record is still being written. */}
      {!isRunning && <ForgetCross press={forget} isRaised={isRaised} onForget={onForget} />}
    </div>
  );
}
