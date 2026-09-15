import { useRef, useState } from "react";

import { useBoxWidth, useWindowKeydown } from "../../../../hooks";
import { timeLabel } from "../../../../utils/dates";
import { RUN_FAILED, runStateLabel, runTotalsLabel } from "../../../record";
import { walkLevels } from "../../logic";
import { PassSwitch, RunGraph, StandingBand, StandingChanges, StepSheet } from "./components";
import { STEP_SHEET_GRAPH_LEAST_PX, STEP_SHEET_INSET_PX, STEP_SHEET_WIDTH_PX } from "./components/step-sheet/constants";
import {
  RUN_DEBUG_ASKED_COLOR,
  RUN_DEBUG_ASKED_FONT_SIZE_PX,
  RUN_DEBUG_BACKGROUND_COLOR,
  RUN_DEBUG_BACK_ICON_PATH,
  RUN_DEBUG_BACK_ICON_SIZE_PX,
  RUN_DEBUG_BACK_LABEL,
  RUN_DEBUG_BORDER_RADIUS_PX,
  RUN_DEBUG_FAILED_NOTE,
  RUN_DEBUG_HEAD_BORDER_COLOR,
  RUN_DEBUG_HEAD_GAP_PX,
  RUN_DEBUG_HEAD_PADDING,
  RUN_DEBUG_HEAD_TONE,
  RUN_DEBUG_NOTE_COLOR,
  RUN_DEBUG_NOTE_FONT_SIZE_PX,
  RUN_DEBUG_NOTE_PADDING,
  RUN_DEBUG_SEPARATOR,
  RUN_DEBUG_STATE_BORDER_RADIUS_PX,
  RUN_DEBUG_STATE_LOOKS,
  RUN_DEBUG_STATE_FONT_SIZE_PX,
  RUN_DEBUG_STATE_LETTER_SPACING_PX,
  RUN_DEBUG_STATE_PADDING,
  RUN_DEBUG_TOTALS_COLOR,
  RUN_DEBUG_WHEN_COLOR,
  RUN_DEBUG_WHEN_FONT_SIZE_PX,
  RUN_DEBUG_WHEN_PREFIX,
} from "./constants";
import { IconButton, Mark } from "../../../../components";
import type { WholeRun } from "../../../record";
import type { RunDebugProps, RunStateLook } from "./interfaces";

/** The run's own word about how it stands, in the colours this pill wears for it. */
function stateOf(run: WholeRun): RunStateLook & { label: string } {
  return {
    ...RUN_DEBUG_STATE_LOOKS[run.state],
    // Only the projection holds the whole walk, so only here can the fallen step be named.
    label: runStateLabel(run.state, brokeAt(run)),
  };
}

/** Which step of the walk fell, counted in levels — nothing where the run did not fall on a step. */
function brokeAt(run: WholeRun): number | null {
  if (run.state !== RUN_FAILED) {
    return null;
  }

  const broke = run.walk.find((step) => step.state === RUN_FAILED) ?? null;

  return broke === null ? null : (walkLevels(run.walk)[broke.id] ?? null);
}

/**
 * The debug projection of one run — its head, and the walk drawn flat under it. The head names
 * the pass by its hour and its question, and names no agent. A turn pressed opens beside the projection, and
 * which turn that is is held here.
 */
export function RunDebug({ run, isFailed, standings, changes, place, passes, onGo, onClose }: RunDebugProps) {
  const field = useRef<HTMLDivElement>(null);
  const width = useBoxWidth(field);
  const [openStepId, setOpenStepId] = useState<string | null>(null);
  /**
   * The sheet stands beside the graph while a sheet's width is left for the graph itself; with less than
   * that it lies along the bottom of the field.
   */
  const isSheetBelow = width > 0 && width - STEP_SHEET_INSET_PX - STEP_SHEET_WIDTH_PX < STEP_SHEET_GRAPH_LEAST_PX;
  const state = run === null ? null : stateOf(run);
  // The open step is looked up in the pass on screen: a step that is not in it is not open at all.
  const openStep = run === null ? null : (run.walk.find((step) => step.id === openStepId) ?? null);

  // What stands over the canvas answers Escape itself, and this stands over the panel too.
  // ⌥← and ⌥→ step between the passes of this flow, and stop at its ends.
  useWindowKeydown(true, (event) => {
    // Escape closes what stands innermost — the open step first, the projection after it.
    if (event.key === "Escape") {
      event.preventDefault();

      if (openStep === null) {
        onClose();
      } else {
        setOpenStepId(null);
      }

      return;
    }

    if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) {
      return;
    }

    const wanted = place + (event.key === "ArrowLeft" ? -1 : 1);

    if (wanted < 1 || wanted > passes) {
      return;
    }

    event.preventDefault();
    onGo(wanted);
  });

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minWidth: 0,
        borderRadius: RUN_DEBUG_BORDER_RADIUS_PX,
        background: RUN_DEBUG_BACKGROUND_COLOR,
      }}
    >
      <div
        className="d-flex align-items-center flex-shrink-0"
        style={{
          padding: RUN_DEBUG_HEAD_PADDING,
          gap: RUN_DEBUG_HEAD_GAP_PX,
          borderBottom: `1px solid ${RUN_DEBUG_HEAD_BORDER_COLOR}`,
        }}
      >
        <IconButton label={RUN_DEBUG_BACK_LABEL} onPress={onClose} tone={RUN_DEBUG_HEAD_TONE}>
          <svg
            width={RUN_DEBUG_BACK_ICON_SIZE_PX}
            height={RUN_DEBUG_BACK_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={RUN_DEBUG_BACK_ICON_PATH} />
          </svg>
        </IconButton>
        {run !== null && state !== null && (
          <>
            {/* The passes of this flow are stepped through from inside, without going out to it. */}
            {passes > 1 && <PassSwitch place={place} count={passes} onGo={onGo} />}
            <Mark color={RUN_DEBUG_WHEN_COLOR} size={RUN_DEBUG_WHEN_FONT_SIZE_PX} className="flex-shrink-0">
              {`${RUN_DEBUG_WHEN_PREFIX}${RUN_DEBUG_SEPARATOR}${timeLabel(run.askedAt)}`}
            </Mark>
            <span
              className="text-truncate"
              style={{
                color: RUN_DEBUG_ASKED_COLOR,
                fontSize: RUN_DEBUG_ASKED_FONT_SIZE_PX,
              }}
            >
              {run.asked}
            </span>
            {/* Which half of this screen is «then» and which is «now» — only where the two have parted. */}
            <StandingBand standings={standings} />
            <span className="flex-fill" />
            <span
              className="font-monospace flex-shrink-0"
              style={{
                padding: state.background === null ? 0 : RUN_DEBUG_STATE_PADDING,
                borderRadius: RUN_DEBUG_STATE_BORDER_RADIUS_PX,
                border: state.border === null ? "none" : `1px solid ${state.border}`,
                background: state.background ?? "transparent",
                color: state.color,
                fontSize: RUN_DEBUG_STATE_FONT_SIZE_PX,
                letterSpacing: RUN_DEBUG_STATE_LETTER_SPACING_PX,
              }}
            >
              {state.label}
            </span>
            <Mark color={RUN_DEBUG_TOTALS_COLOR} isUpperCase={false} className="flex-shrink-0">
              {runTotalsLabel(run)}
            </Mark>
          </>
        )}
      </div>
      {isFailed && (
        <span
          style={{
            padding: RUN_DEBUG_NOTE_PADDING,
            color: RUN_DEBUG_NOTE_COLOR,
            fontSize: RUN_DEBUG_NOTE_FONT_SIZE_PX,
          }}
        >
          {RUN_DEBUG_FAILED_NOTE}
        </span>
      )}
      {run !== null && (
        <div
          ref={field}
          className="d-flex flex-fill"
          style={{
            position: "relative",
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <RunGraph
            run={run}
            standings={standings}
            openStepId={openStep === null ? null : openStep.id}
            onOpen={setOpenStepId}
          />
          {openStep !== null && (
            <StepSheet
              step={openStep}
              walk={run.walk}
              isBelow={isSheetBelow}
              onGo={setOpenStepId}
              onClose={() => setOpenStepId(null)}
            />
          )}
        </div>
      )}
      {/* What has moved since the run walked, under the graph it is about. */}
      <StandingChanges changes={changes} />
    </div>
  );
}
