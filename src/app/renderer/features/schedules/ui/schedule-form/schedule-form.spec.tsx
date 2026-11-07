import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ScheduleForm } from "./schedule-form";
import { anAgent } from "../../../../testing";
import type { ProjectSchedule } from "../../../../interfaces";
import type { ScheduleFormProps } from "./interfaces";

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

function props(patch: Partial<ScheduleFormProps> = {}): ScheduleFormProps {
  return {
    values: {
      agentId: "agent-1",
      task: "Прогони всі тести",
      everyMinutes: "15",
    },
    schedule: SCHEDULE,
    agents: AGENTS,
    isOn: false,
    isDirty: false,
    onChange: vi.fn(),
    onSwitch: vi.fn(),
    onSave: vi.fn(async () => {}),
    onCancel: vi.fn(),
    onRevert: vi.fn(),
    onDelete: vi.fn(),
    ...patch,
  };
}

describe("ScheduleForm", () => {
  it("heads the step with the schedule's agent, and offers deletion beside the save", () => {
    render(<ScheduleForm {...props()} />);

    expect(screen.getByText("Розклад · NIGHTLY")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Видалити",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Зберегти",
      }),
    ).toBeInTheDocument();
  });

  it("heads a new schedule as new, and offers to create it", () => {
    render(
      <ScheduleForm
        {...props({
          schedule: null,
        })}
      />,
    );

    expect(screen.getByText("Розклад · Новий")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Створити",
      }),
    ).toBeInTheDocument();
  });

  it("heads the step with no name where its agent is gone, and says the agent is gone", () => {
    render(
      <ScheduleForm
        {...props({
          values: {
            agentId: "agent-gone",
            task: "Прогони всі тести",
            everyMinutes: "15",
          },
        })}
      />,
    );

    expect(screen.getByText("Розклад")).toBeInTheDocument();
    expect(screen.getByText("агента немає")).toBeInTheDocument();
  });

  it("says the least interval under an interval of none", () => {
    render(
      <ScheduleForm
        {...props({
          values: {
            agentId: "agent-1",
            task: "Прогони всі тести",
            everyMinutes: "0",
          },
        })}
      />,
    );

    expect(screen.getByText("Найменше 1.")).toBeInTheDocument();
  });

  it("does not save a schedule with a field missing", async () => {
    const onSave = vi.fn(async () => {});

    render(
      <ScheduleForm
        {...props({
          values: {
            agentId: null,
            task: "",
            everyMinutes: "",
          },
          schedule: null,
          onSave,
        })}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: "Створити",
      }),
    );

    expect(onSave).not.toHaveBeenCalled();
  });

  it("switches this machine at the press, without a save", async () => {
    const onSwitch = vi.fn();

    render(
      <ScheduleForm
        {...props({
          onSwitch,
        })}
      />,
    );
    await userEvent.click(
      screen.getByRole("switch", {
        name: "Увімкнено",
      }),
    );

    expect(onSwitch).toHaveBeenCalledWith(true);
  });
});
