import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SchedulesPanel } from "./schedules-panel";
import { anAgent } from "../../../../testing";
import type { ProjectSchedule } from "../../../../interfaces";
import type { ScheduleSection, SchedulesState } from "../../hooks";
import type { SchedulesPanelProps } from "./interfaces";

const AGENTS = [
  anAgent({
    id: "agent-1",
    name: "NIGHTLY",
  }),
];
const SCHEDULE: ProjectSchedule = {
  id: "schedule-1",
  agentId: "agent-1",
  task: "Прогони всі тести",
  everyMinutes: 15,
};
const CLOCK: SchedulesState = {
  standings: {},
  now: 0,
  switchOn: vi.fn(async () => {}),
};
const CLOSED: ScheduleSection = {
  openScheduleId: null,
  openSchedule: null,
  form: null,
  isNewOn: false,
  unsaved: null,
  armedSchedule: null,
  openForm: vi.fn(),
  editForm: vi.fn(),
  switchOpen: vi.fn(),
  saveForm: vi.fn(async () => {}),
  arm: vi.fn(),
  confirmDelete: vi.fn(),
  dismissDelete: vi.fn(),
};

function props(patch: Partial<SchedulesPanelProps> = {}): SchedulesPanelProps {
  return {
    schedules: [SCHEDULE],
    agents: AGENTS,
    clock: CLOCK,
    section: CLOSED,
    onOpenForm: vi.fn(),
    onCancelForm: vi.fn(),
    ...patch,
  };
}

describe("SchedulesPanel", () => {
  it("puts the one action in the middle of an empty section", async () => {
    const onOpenForm = vi.fn();

    render(
      <SchedulesPanel
        {...props({
          schedules: [],
          onOpenForm,
        })}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: /Новий розклад/,
      }),
    );

    expect(screen.getByText("Розкладів ще немає. Агенти працюють, лише коли їх питають.")).toBeInTheDocument();
    expect(onOpenForm).toHaveBeenCalledWith("new");
  });

  it("lists the schedules and opens one's form at a press on its row", async () => {
    const onOpenForm = vi.fn();

    render(
      <SchedulesPanel
        {...props({
          onOpenForm,
        })}
      />,
    );
    await userEvent.click(screen.getByText("Прогони всі тести"));

    expect(onOpenForm).toHaveBeenCalledWith("schedule-1");
  });

  it("stands the form in place of the list while one is open", () => {
    render(
      <SchedulesPanel
        {...props({
          section: {
            ...CLOSED,
            openScheduleId: "schedule-1",
            openSchedule: SCHEDULE,
            form: {
              agentId: "agent-1",
              task: "Прогони всі тести",
              everyMinutes: "15",
            },
          },
        })}
      />,
    );

    expect(screen.getByText("Розклад · NIGHTLY")).toBeInTheDocument();
    expect(screen.queryByText("КОЖНІ 15 ХВ")).toBeNull();
  });
});
