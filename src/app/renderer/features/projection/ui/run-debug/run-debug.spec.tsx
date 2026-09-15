import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RunDebug } from "./run-debug";
import { RUN_DEBUG_BACK_LABEL } from "./constants";
import { PASS_SWITCH_BACK_LABEL, PASS_SWITCH_ON_LABEL } from "./components/pass-switch/constants";
import { RUN_DONE, RUN_FAILED, RUN_STEP_DONE, RUN_STEP_FAILED, runStateLabel } from "../../../record";
import type { WholeRun, WholeStep } from "../../../record";
import { STANDING_BAND_LABEL } from "../../constants";
import { aStep } from "../../../../testing";

function step(patch: Partial<WholeStep> = {}): WholeStep {
  return aStep({
    agentName: "EDITOR",
    agentColor: "#38a3ff",
    model: "claude-sonnet-4.5",
    providerId: "anthropic",
    contextCeiling: 200_000,
    temperature: 0.3,
    asked: "Додай кешування у fetchUser",
    said: "Готово",
    state: RUN_STEP_DONE,
    startedAt: new Date("2026-08-31T15:41:00"),
    endedAt: new Date("2026-08-31T15:41:12"),
    ...patch,
  });
}

function run(walk: WholeStep[], state = RUN_DONE): WholeRun {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "EDITOR",
    startedByAgentColor: "#38a3ff",
    askedAgentId: "agent-1",
    askedAgentName: "EDITOR",
    asked: "Додай кешування у fetchUser і онови тести",
    state,
    startedAt: new Date("2026-08-31T15:41:00"),
    askedAt: new Date("2026-08-31T15:41:00"),
    endedAt: new Date("2026-08-31T15:44:06"),
    questions: [
      {
        id: "question-1",
        place: 1,
        asked: "Додай кешування у fetchUser і онови тести",
        askedAt: new Date("2026-08-31T15:41:00"),
        askedAgentId: "agent-1",
      },
    ],
    steps: walk.length,
    money: 0.21,
    worked: 186_000,
    walk,
  };
}

describe("RunDebug", () => {
  it("heads the projection with whose run it is, what was asked, how it ended and what it cost", () => {
    render(
      <RunDebug
        run={run([
          step(),
          step({
            id: "step-2",
            place: 2,
            fromStepIds: ["step-1"],
          }),
        ])}
        isFailed={false}
        standings={[]}
        changes={[]}
        place={1}
        passes={1}
        onGo={() => {}}
        onClose={() => {}}
      />,
    );

    // The pass is named by its hour and its question, and no agent stands in that name.
    expect(screen.getByText("Прогін · 15:41")).toBeInTheDocument();
    expect(screen.getByText("Додай кешування у fetchUser і онови тести")).toBeInTheDocument();
    expect(screen.getByText(runStateLabel(RUN_DONE))).toBeInTheDocument();
    // «3 хв 06 · 2 КРОКИ · 1 200 ТКН · $0.21» — the whole run in one line.
    expect(screen.getByText(/2 КРОКИ · 1 200 ТКН · \$0\.21/)).toBeInTheDocument();
  });

  it("names the step a run fell on, since that is the first thing looked for", () => {
    const broke = step({
      id: "step-2",
      place: 2,
      fromStepIds: ["step-1"],
      state: RUN_STEP_FAILED,
    });

    render(
      <RunDebug
        run={run([step(), broke], RUN_FAILED)}
        isFailed={false}
        standings={[]}
        changes={[]}
        place={1}
        passes={1}
        onGo={() => {}}
        onClose={() => {}}
      />,
    );

    // The second step stands one level below the first, and that is the step it fell on.
    expect(screen.getByText(runStateLabel(RUN_FAILED, 2))).toBeInTheDocument();
  });

  it("goes back to the canvas on Escape, since it stands over the canvas and the panel alike", () => {
    const onClose = vi.fn();

    render(
      <RunDebug
        run={run([step()])}
        isFailed={false}
        standings={[]}
        changes={[]}
        place={1}
        passes={1}
        onGo={() => {}}
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(window, {
      key: "Escape",
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("goes back to the canvas", async () => {
    const onClose = vi.fn();

    render(
      <RunDebug
        run={run([step()])}
        isFailed={false}
        standings={[]}
        changes={[]}
        place={1}
        passes={1}
        onGo={() => {}}
        onClose={onClose}
      />,
    );
    screen.getByLabelText(RUN_DEBUG_BACK_LABEL).click();

    expect(onClose).toHaveBeenCalled();
  });

  it("says which pass of the flow stands open, and steps to the one beside it", () => {
    const onGo = vi.fn();

    render(
      <RunDebug
        run={run([step()])}
        isFailed={false}
        standings={[]}
        changes={[]}
        place={2}
        passes={2}
        onGo={onGo}
        onClose={() => {}}
      />,
    );

    // «‹ ПИТАННЯ 2 З 2 ›» — the passes of this flow, in the order they were asked.
    expect(screen.getByText("Питання 2 з 2")).toBeInTheDocument();
    screen.getByLabelText(PASS_SWITCH_BACK_LABEL).click();

    expect(onGo).toHaveBeenCalledWith(1);
  });

  it("goes out at the end of the list instead of turning round to the other end", () => {
    const onGo = vi.fn();

    render(
      <RunDebug
        run={run([step()])}
        isFailed={false}
        standings={[]}
        changes={[]}
        place={2}
        passes={2}
        onGo={onGo}
        onClose={() => {}}
      />,
    );

    // The edge of the flow is seen on the arrow itself, so it is never tried by mistake.
    expect(screen.getByLabelText(PASS_SWITCH_ON_LABEL)).toBeDisabled();
    screen.getByLabelText(PASS_SWITCH_ON_LABEL).click();

    expect(onGo).not.toHaveBeenCalled();
  });

  it("steps between passes with ⌥← and ⌥→, and stops at the ends of the flow", () => {
    const onGo = vi.fn();

    render(
      <RunDebug
        run={run([step()])}
        isFailed={false}
        standings={[]}
        changes={[]}
        place={1}
        passes={2}
        onGo={onGo}
        onClose={() => {}}
      />,
    );
    fireEvent.keyDown(window, {
      key: "ArrowLeft",
      altKey: true,
    });

    expect(onGo).not.toHaveBeenCalled();

    fireEvent.keyDown(window, {
      key: "ArrowRight",
      altKey: true,
    });

    expect(onGo).toHaveBeenCalledWith(2);
  });

  it("carries no switch where the flow holds a single pass, since there is nowhere to step", () => {
    render(
      <RunDebug
        run={run([step()])}
        isFailed={false}
        standings={[]}
        changes={[]}
        place={1}
        passes={1}
        onGo={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.queryByLabelText(PASS_SWITCH_ON_LABEL)).not.toBeInTheDocument();
  });

  it("says over the head which half of the screen is «then» and which is «now», where the two have parted", () => {
    render(
      <RunDebug
        run={run([step()])}
        isFailed={false}
        standings={[
          {
            id: "agent-1",
            name: "WRITER",
            color: "#6fd3d8",
            wasName: "EDITOR",
            isGone: false,
          },
        ]}
        changes={[]}
        place={1}
        passes={1}
        onGo={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText(STANDING_BAND_LABEL)).toBeInTheDocument();
  });

  it("keeps the head quiet over a run the project still agrees with", () => {
    render(
      <RunDebug
        run={run([step()])}
        isFailed={false}
        standings={[]}
        changes={[]}
        place={1}
        passes={1}
        onGo={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.queryByText(STANDING_BAND_LABEL)).not.toBeInTheDocument();
  });
});
