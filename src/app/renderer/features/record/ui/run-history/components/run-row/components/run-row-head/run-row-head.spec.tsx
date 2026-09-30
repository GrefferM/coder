import { RUN_HISTORY_SEPARATOR } from "../../../../../../constants";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RunRowHead } from "./run-row-head";
import {
  RUN_DONE,
  RUN_FAILED,
  RUN_NOT_SENT,
  RUN_RUNNING,
  RUN_STATE_LABELS,
  RUN_STOPPED,
} from "../../../../../../constants";
import { spanLabel, timeLabel } from "../../../../../../../../utils/dates";
import {
  RUN_HISTORY_EMPTY_DOT_BORDER,
  RUN_HISTORY_FAILED_COLOR,
  RUN_HISTORY_RUNNING_COLOR,
  RUN_HISTORY_GONE_NAME_COLOR,
  RUN_HISTORY_QUIET_COLOR,
} from "../../../../constants";
import type { NamedAgent } from "../../../../../../../../interfaces";
import type { RunRow } from "../../../../../../interfaces";

const ASKED_AT = new Date(2026, 8, 6, 14, 5);

// The project's agents; the head looks the name up by id only.
const AGENTS: NamedAgent[] = [
  {
    id: "agent-1",
    name: "ШУКАЧ",
    color: "#6fd3d8",
  },
];

function row(patch: Partial<RunRow> = {}): RunRow {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "Шукач",
    startedByAgentColor: "#6fd3d8",
    askedAgentId: "agent-1",
    askedAgentName: "Шукач",
    asked: "Знайди md-файли",
    state: RUN_DONE,
    startedAt: ASKED_AT,
    askedAt: ASKED_AT,
    endedAt: ASKED_AT,
    steps: 2,
    money: 0.0031,
    worked: 5_500,
    ...patch,
  };
}

describe("RunRowHead", () => {
  it("names whom the flow was asked last, by the name that agent goes by today", () => {
    // The head shows the agent's current name, not the one the record kept.
    render(<RunRowHead run={row()} agents={AGENTS} isRunning={false} isRaised={false} />);

    expect(screen.getByText("ШУКАЧ")).toBeInTheDocument();
    expect(screen.queryByText("Шукач")).not.toBeInTheDocument();
  });

  it("names the agent the last question went to, not the one the flow started from", () => {
    // The head names the last addressee, not the first.
    render(
      <RunRowHead
        run={row({
          askedAgentId: "agent-2",
          askedAgentName: "РЕВ'ЮЕР",
        })}
        agents={AGENTS}
        isRunning={false}
        isRaised={false}
      />,
    );

    expect(screen.getByText("РЕВ'ЮЕР")).toBeInTheDocument();
    expect(screen.queryByText("ШУКАЧ")).not.toBeInTheDocument();
  });

  it("names an agent the project no longer holds from the record, and says so by going dimmer", () => {
    // Current name for an existing agent, the record's for a gone one, drawn quieter.
    render(
      <RunRowHead
        run={row({
          askedAgentId: "agent-gone",
          askedAgentName: "ЛІНТЕР",
        })}
        agents={AGENTS}
        isRunning={false}
        isRaised={false}
      />,
    );

    expect(screen.getByText("ЛІНТЕР")).toHaveStyle({
      color: RUN_HISTORY_GONE_NAME_COLOR,
    });
  });

  it("wears the agent's own colour, so a row is read by whom it belongs to and not by its words", () => {
    // The name wears the agent's colour.
    render(<RunRowHead run={row()} agents={AGENTS} isRunning={false} isRaised={false} />);

    expect(screen.getByText("ШУКАЧ")).toHaveStyle({
      color: "#6fd3d8",
    });
  });

  it("says the fifth word where nothing was sent, and draws its dot as an empty place", () => {
    // A not-sent run is not red: the word is quiet and the dot is an empty outline.
    render(
      <RunRowHead
        run={row({
          state: RUN_NOT_SENT,
        })}
        agents={AGENTS}
        isRunning={false}
        isRaised={false}
      />,
    );

    expect(screen.getByText(RUN_STATE_LABELS[RUN_NOT_SENT])).toHaveStyle({
      color: RUN_HISTORY_QUIET_COLOR,
    });
    expect(screen.getByText(RUN_STATE_LABELS[RUN_NOT_SENT]).previousElementSibling).toHaveStyle({
      border: RUN_HISTORY_EMPTY_DOT_BORDER,
    });
  });

  it("keeps every state word quiet, whatever the state, so the head has one coloured word and it is the name", () => {
    // No pill in any of the five states.
    const { rerender } = render(<RunRowHead run={row()} agents={AGENTS} isRunning={false} isRaised={false} />);

    for (const [state, label] of [
      [RUN_DONE, RUN_STATE_LABELS[RUN_DONE]],
      [RUN_FAILED, RUN_STATE_LABELS[RUN_FAILED]],
      [RUN_STOPPED, RUN_STATE_LABELS[RUN_STOPPED]],
      [RUN_RUNNING, RUN_STATE_LABELS[RUN_RUNNING]],
      [RUN_NOT_SENT, RUN_STATE_LABELS[RUN_NOT_SENT]],
    ]) {
      rerender(
        <RunRowHead
          run={row({
            state,
          })}
          agents={AGENTS}
          isRunning={state === RUN_RUNNING}
          isRaised={false}
        />,
      );

      expect(screen.getByText(label)).toHaveStyle({
        color: RUN_HISTORY_QUIET_COLOR,
        background: "",
      });
    }
  });

  it("says no duration where the flow worked no time at all, «0 с» being a span nobody spent", () => {
    render(
      <RunRowHead
        run={row({
          state: RUN_NOT_SENT,
          worked: 0,
        })}
        agents={AGENTS}
        isRunning={false}
        isRaised={false}
      />,
    );

    expect(screen.getByText(timeLabel(ASKED_AT))).toBeInTheDocument();
  });

  it("says the hour the flow last spoke and the work under it, not the waiting", () => {
    // The hour is the flow's last word; the span sums every written step.
    render(<RunRowHead run={row()} agents={AGENTS} isRunning={false} isRaised={false} />);

    expect(screen.getByText(`${timeLabel(ASKED_AT)}${RUN_HISTORY_SEPARATOR}${spanLabel(5_500)}`)).toBeInTheDocument();
  });

  it("says the hour the reply came back, and not the hour the question went out", () => {
    // The hour is the flow's last word, which the list is sorted by, not the hour it was asked.
    const CAME_BACK = new Date(2026, 8, 6, 14, 39);

    render(
      <RunRowHead
        run={row({
          endedAt: CAME_BACK,
        })}
        agents={AGENTS}
        isRunning={false}
        isRaised={false}
      />,
    );

    expect(screen.getByText(`${timeLabel(CAME_BACK)}${RUN_HISTORY_SEPARATOR}${spanLabel(5_500)}`)).toBeInTheDocument();
  });

  it("wears the hour of the question while the walk is still out, there being no reply to name yet", () => {
    render(
      <RunRowHead
        run={row({
          state: RUN_RUNNING,
          endedAt: null,
        })}
        agents={AGENTS}
        isRunning
        isRaised={false}
      />,
    );

    expect(screen.getByText(`${timeLabel(ASKED_AT)}${RUN_HISTORY_SEPARATOR}${spanLabel(5_500)}`)).toBeInTheDocument();
  });

  it("says how the run stands whatever state it is in, so the head is never empty on the left", () => {
    const { rerender } = render(<RunRowHead run={row()} agents={AGENTS} isRunning={false} isRaised={false} />);

    expect(screen.getByText(RUN_STATE_LABELS[RUN_DONE])).toBeInTheDocument();

    rerender(
      <RunRowHead
        run={row({
          state: RUN_FAILED,
        })}
        agents={AGENTS}
        isRunning={false}
        isRaised={false}
      />,
    );

    expect(screen.getByText(RUN_STATE_LABELS[RUN_FAILED])).toBeInTheDocument();

    rerender(
      <RunRowHead
        run={row({
          state: RUN_STOPPED,
        })}
        agents={AGENTS}
        isRunning={false}
        isRaised={false}
      />,
    );

    expect(screen.getByText(RUN_STATE_LABELS[RUN_STOPPED])).toBeInTheDocument();

    rerender(
      <RunRowHead
        run={row({
          state: RUN_RUNNING,
        })}
        agents={AGENTS}
        isRunning
        isRaised={false}
      />,
    );

    expect(screen.getByText(RUN_STATE_LABELS[RUN_RUNNING])).toBeInTheDocument();
  });

  it("carries the colour of the state in the dot, the word beside it being quiet in every state", () => {
    // The dot carries each state's colour.
    const { rerender } = render(<RunRowHead run={row()} agents={AGENTS} isRunning={false} isRaised={false} />);

    expect(screen.getByText(RUN_STATE_LABELS[RUN_DONE]).previousElementSibling).toHaveStyle({
      background: RUN_HISTORY_QUIET_COLOR,
    });

    rerender(
      <RunRowHead
        run={row({
          state: RUN_FAILED,
        })}
        agents={AGENTS}
        isRunning={false}
        isRaised={false}
      />,
    );

    expect(screen.getByText(RUN_STATE_LABELS[RUN_FAILED]).previousElementSibling).toHaveStyle({
      background: RUN_HISTORY_FAILED_COLOR,
    });

    rerender(
      <RunRowHead
        run={row({
          state: RUN_RUNNING,
        })}
        agents={AGENTS}
        isRunning
        isRaised={false}
      />,
    );

    expect(screen.getByText(RUN_STATE_LABELS[RUN_RUNNING]).previousElementSibling).toHaveStyle({
      background: RUN_HISTORY_RUNNING_COLOR,
    });
  });
});
