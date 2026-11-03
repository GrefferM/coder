import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ForgetRunsConfirm } from "./forget-runs-confirm";
import {
  FORGET_RUNS_NOTE,
  FORGET_RUNS_NOTE_SUFFIX,
  FORGET_RUNS_QUESTION_PREFIX,
  FORGET_RUNS_QUESTION_SUFFIX,
  FORGET_RUNS_YES_PREFIX,
} from "./constants";
import { RUNS_SPAN_MIDDLE, RUNS_SPAN_PREFIX } from "../../constants";
import { daySpoken } from "../../../../utils/dates";
import { RUN_DONE } from "../../constants";
import type { RunRow } from "../../interfaces";

function run(id: string, startedAt: Date): RunRow {
  return {
    id,
    startedByAgentId: "agent-1",
    startedByAgentName: "Шукач",
    startedByAgentColor: "#6fd3d8",
    askedAgentId: "agent-1",
    askedAgentName: "Шукач",
    asked: "Знайди md-файли",
    state: RUN_DONE,
    startedAt,
    askedAt: startedAt,
    endedAt: startedAt,
    steps: 1,
    money: null,
    worked: 1_000,
  };
}

describe("ForgetRunsConfirm", () => {
  it("counts the rows in the question, in the form the number takes", () => {
    const newest = new Date(2026, 8, 6, 10, 0);
    const oldest = new Date(2026, 8, 2, 10, 0);

    render(
      <ForgetRunsConfirm
        runs={[run("run-1", newest), run("run-2", oldest)]}
        onConfirm={() => {}}
        onDismiss={() => {}}
      />,
    );

    expect(
      screen.getByText(`${FORGET_RUNS_QUESTION_PREFIX}2 запуски${FORGET_RUNS_QUESTION_SUFFIX}`),
    ).toBeInTheDocument();
    expect(screen.getByText(`${FORGET_RUNS_YES_PREFIX}2`)).toBeInTheDocument();
  });

  it("names the days the list spans, newest first", () => {
    const now = new Date();
    const newest = new Date(2026, 8, 6, 10, 0);
    const oldest = new Date(2026, 8, 2, 10, 0);

    render(
      <ForgetRunsConfirm
        runs={[run("run-1", newest), run("run-2", oldest)]}
        onConfirm={() => {}}
        onDismiss={() => {}}
      />,
    );

    const span = `${RUNS_SPAN_PREFIX}${daySpoken(newest, now)}${RUNS_SPAN_MIDDLE}${daySpoken(oldest, now)}`;

    expect(screen.getByText(`${FORGET_RUNS_NOTE}${span}${FORGET_RUNS_NOTE_SUFFIX}`)).toBeInTheDocument();
  });

  it("drops the span where every run is of one day, there being nothing to span", () => {
    const day = new Date(2026, 8, 6, 10, 0);

    render(
      <ForgetRunsConfirm runs={[run("run-1", day), run("run-2", day)]} onConfirm={() => {}} onDismiss={() => {}} />,
    );

    expect(screen.getByText(`${FORGET_RUNS_NOTE}${FORGET_RUNS_NOTE_SUFFIX}`)).toBeInTheDocument();
  });

  it("deletes them all on the yes", async () => {
    const onConfirm = vi.fn();
    const day = new Date(2026, 8, 6, 10, 0);

    render(<ForgetRunsConfirm runs={[run("run-1", day)]} onConfirm={onConfirm} onDismiss={() => {}} />);
    await userEvent.click(screen.getByText(`${FORGET_RUNS_YES_PREFIX}1`));

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
