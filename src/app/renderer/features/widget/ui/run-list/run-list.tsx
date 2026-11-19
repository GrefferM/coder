import { Mark } from "../../../../components";
import { dayLabel, timeLabel } from "../../../../utils/dates";
import {
  FORGET_RUN_LABEL,
  FORGET_RUNS_PREFIX,
  WIDGET_CHIP_NAME_COLOR,
  WIDGET_RUN_GAP_PX,
  WIDGET_LIST_ROW_LIT_COLOR,
  WIDGET_RUN_PADDING,
  WIDGET_LIST_ROW_RADIUS_PX,
  WIDGET_RUNS_PADDING,
  WIDGET_STEP_NOTE_COLOR,
  WIDGET_TEXT_FONT_SIZE_PX,
} from "../../constants";
import { WidgetCross } from "../widget-cross";
import type { RunListProps } from "../../interfaces";

/**
 * The sphere's past conversations in the output's place, newest first: a press opens one to read and go on in, a cross
 * beside an ended one deletes it, and «× Видалити N» over the list deletes every ended one.
 */
export function RunList({ runs, openedRunId, onOpen, onForget, onForgetAll }: RunListProps) {
  const ended = runs.filter((run) => run.endedAt !== null);

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        padding: WIDGET_RUNS_PADDING,
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      {ended.length > 0 && (
        <button
          type="button"
          onClick={onForgetAll}
          className="align-self-end"
          style={{
            padding: WIDGET_RUN_PADDING,
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <Mark color={WIDGET_STEP_NOTE_COLOR}>{`${FORGET_RUNS_PREFIX}${ended.length}`}</Mark>
        </button>
      )}
      {runs.map((run) => (
        <div key={run.id} className="d-flex align-items-start">
          <button
            type="button"
            onClick={() => onOpen(run.id)}
            className="d-flex flex-column flex-fill text-start"
            style={{
              minWidth: 0,
              gap: WIDGET_RUN_GAP_PX,
              padding: WIDGET_RUN_PADDING,
              border: "none",
              borderRadius: WIDGET_LIST_ROW_RADIUS_PX,
              background: run.id === openedRunId ? WIDGET_LIST_ROW_LIT_COLOR : "transparent",
              cursor: "pointer",
            }}
          >
            <span
              className="text-truncate w-100"
              style={{
                color: WIDGET_CHIP_NAME_COLOR,
                fontSize: WIDGET_TEXT_FONT_SIZE_PX,
              }}
            >
              {run.asked}
            </span>
            <Mark color={WIDGET_STEP_NOTE_COLOR}>
              {`${dayLabel(new Date(run.askedAt), new Date())} · ${timeLabel(new Date(run.askedAt))}`}
            </Mark>
          </button>
          {run.endedAt !== null && <WidgetCross label={FORGET_RUN_LABEL} onPress={() => onForget(run)} />}
        </div>
      ))}
    </div>
  );
}
