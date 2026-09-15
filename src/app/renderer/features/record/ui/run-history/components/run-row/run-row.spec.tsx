import { RUN_HISTORY_SEPARATOR } from "../../../../constants";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RunRowLine } from "./run-row";
import { RUN_DONE, RUN_NOT_SENT, RUN_RUNNING } from "../../../../constants";
import {
  RUN_HISTORY_NO_MONEY_LABEL,
  RUN_HISTORY_FORGET_LABEL,
  RUN_HISTORY_OPEN_HINT,
  RUN_HISTORY_STARTED_PREFIX,
} from "../../constants";
import { stepsLabel } from "../../../../words";
import { dayLabel } from "../../../../../../utils/dates";
import { moneyLabel } from "../../../../../../utils/numbers";
import type { NamedAgent } from "../../../../../../interfaces";
import type { RunRow } from "../../../../interfaces";

const NOW = new Date(2026, 8, 6, 18, 0);
const ASKED_AT = new Date(2026, 8, 6, 14, 5);

// The project as it stands today — the head of the row looks its name up here, by the agent's id.
const AGENTS: NamedAgent[] = [
  {
    id: "agent-1",
    name: "Шукач",
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
    steps: 3,
    money: 0.0031,
    worked: 5_500,
    ...patch,
  };
}

describe("RunRowLine", () => {
  it("names the money as a word where nothing was spent, «—» reading as a sum nobody counted", () => {
    // A flow that sent nothing spent nothing, and the row says so in words rather than in a dash.
    render(
      <RunRowLine
        run={row({
          state: RUN_NOT_SENT,
          steps: 1,
          money: null,
        })}
        agents={AGENTS}
        now={NOW}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText(new RegExp(RUN_HISTORY_NO_MONEY_LABEL))).toBeInTheDocument();
  });

  it("counts the one step of a flow that sent nothing, that step being no walk but the record of a question", () => {
    // One step is the walk itself and goes uncounted — but where nothing went there was no walk,
    // and the line would otherwise say only what was not spent.
    render(
      <RunRowLine
        run={row({
          state: RUN_NOT_SENT,
          steps: 1,
          money: null,
        })}
        agents={AGENTS}
        now={NOW}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText(new RegExp(stepsLabel(1)))).toBeInTheDocument();
  });

  it("stands what was asked over what the walk came to", () => {
    render(<RunRowLine run={row()} agents={AGENTS} now={NOW} onOpen={() => {}} onForget={() => {}} />);

    expect(screen.getByText("Знайди md-файли")).toBeInTheDocument();
    expect(screen.getByText(`${stepsLabel(3)}${RUN_HISTORY_SEPARATOR}${moneyLabel(0.0031)}`)).toBeInTheDocument();
  });

  it("counts no steps where there was but one, a single step being the walk itself", () => {
    render(
      <RunRowLine
        run={row({
          steps: 1,
        })}
        agents={AGENTS}
        now={NOW}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText(moneyLabel(0.0031))).toBeInTheDocument();
  });

  it("says when a flow began where that is not the day it stands under", () => {
    // A flow asked again today is grouped by today, so it says under itself where it started.
    const began = new Date(2026, 8, 4, 9, 0);

    render(
      <RunRowLine
        run={row({
          startedAt: began,
          steps: 1,
        })}
        agents={AGENTS}
        now={NOW}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(
      screen.getByText(
        `${moneyLabel(0.0031)}${RUN_HISTORY_SEPARATOR}${RUN_HISTORY_STARTED_PREFIX}${dayLabel(began, NOW)}`,
      ),
    ).toBeInTheDocument();
  });

  it("opens the run in the stream on a press", async () => {
    const onOpen = vi.fn();

    render(<RunRowLine run={row()} agents={AGENTS} now={NOW} onOpen={onOpen} onForget={() => {}} />);
    await userEvent.click(screen.getByLabelText(RUN_HISTORY_OPEN_HINT));

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("offers no deletion while the run is still going, half a record being nobody's", async () => {
    // The cross stands beside the row, and only over a record that is finished.
    const onForget = vi.fn();
    const { rerender } = render(
      <RunRowLine
        run={row({
          state: RUN_RUNNING,
          endedAt: null,
        })}
        agents={AGENTS}
        now={NOW}
        onOpen={() => {}}
        onForget={onForget}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: RUN_HISTORY_FORGET_LABEL,
      }),
    ).not.toBeInTheDocument();

    rerender(<RunRowLine run={row()} agents={AGENTS} now={NOW} onOpen={() => {}} onForget={onForget} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: RUN_HISTORY_FORGET_LABEL,
      }),
    );

    expect(onForget).toHaveBeenCalledOnce();
  });
});
