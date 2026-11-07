import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScheduleRow } from "./schedule-row";
import { anAgent } from "../../../../../../testing";
import type { ProjectSchedule, ScheduleStanding } from "../../../../../../interfaces";

const MINUTE = 60_000;
const AGENTS = [
  anAgent({
    id: "agent-1",
    name: "REVIEWER",
  }),
];
const SCHEDULE: ProjectSchedule = {
  id: "schedule-1",
  agentId: "agent-1",
  task: "Переглянь нові коміти",
  everyMinutes: 90,
  isActive: true,
};
const ON: ScheduleStanding = {
  scheduleId: "schedule-1",
  nextAt: 72 * MINUTE,
  outSince: null,
};

describe("ScheduleRow", () => {
  it("says a schedule switched on, its agent and task, how often and how soon", () => {
    render(<ScheduleRow schedule={SCHEDULE} agents={AGENTS} standing={ON} now={0} onOpen={() => {}} />);

    expect(screen.getByText("УВІМКНЕНО")).toBeInTheDocument();
    expect(screen.getByText("REVIEWER")).toBeInTheDocument();
    expect(screen.getByText("Переглянь нові коміти")).toBeInTheDocument();
    expect(screen.getByText("КОЖНІ 1 ГОД 30 ХВ · НАСТУПНИЙ ЧЕРЕЗ 1 ГОД 12 ХВ")).toBeInTheDocument();
  });

  it("says no countdown for a schedule switched off", () => {
    render(
      <ScheduleRow
        schedule={{
          ...SCHEDULE,
          isActive: false,
        }}
        agents={AGENTS}
        standing={{
          ...ON,
          nextAt: null,
        }}
        now={0}
        onOpen={() => {}}
      />,
    );

    expect(screen.getByText("ВИМКНЕНО")).toBeInTheDocument();
    expect(screen.getByText("КОЖНІ 1 ГОД 30 ХВ")).toBeInTheDocument();
  });

  it("says the agent is gone instead of the switch, and names no agent", () => {
    render(
      <ScheduleRow
        schedule={{
          ...SCHEDULE,
          agentId: "agent-gone",
        }}
        agents={AGENTS}
        standing={ON}
        now={0}
        onOpen={() => {}}
      />,
    );

    expect(screen.getByText("НЕМА АГЕНТА")).toBeInTheDocument();
    expect(screen.queryByText("REVIEWER")).toBeNull();
    expect(screen.queryByText(/НАСТУПНИЙ/)).toBeNull();
  });

  it("names the field not written", () => {
    render(
      <ScheduleRow
        schedule={{
          ...SCHEDULE,
          everyMinutes: null,
          isActive: true,
        }}
        agents={AGENTS}
        standing={ON}
        now={0}
        onOpen={() => {}}
      />,
    );

    expect(screen.getByText("НЕ ЗАПОВНЕНО · ІНТЕРВАЛ")).toBeInTheDocument();
  });

  it("says a task out, with the hour it went", () => {
    const outSince = new Date(2026, 10, 7, 10, 15).getTime();

    render(
      <ScheduleRow
        schedule={SCHEDULE}
        agents={AGENTS}
        standing={{
          ...ON,
          outSince,
        }}
        now={outSince}
        onOpen={() => {}}
      />,
    );

    expect(screen.getByText("ІДЕ")).toBeInTheDocument();
    expect(screen.getByText(/^10:15/)).toBeInTheDocument();
  });
});
