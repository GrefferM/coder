import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GrantView } from "./grant-view";
import type { CommandToolGrant, ProjectCommand } from "../../../../../../../../interfaces";
import { aCommand } from "../../../../../../../../testing";

const COMMAND: ProjectCommand = aCommand({
  name: "run_tests",
  description: "Прогнати тести проєкту й повернути звіт",
  run: "npm test -- {pattern}",
  parameters: [
    {
      id: "parameter-1",
      name: "pattern",
      type: "text",
      description: "Маска файлів тестів",
      isRequired: false,
      values: [],
    },
    {
      id: "parameter-2",
      name: "timeout",
      type: "number",
      description: "Скільки чекати",
      isRequired: false,
      values: [],
    },
  ],
});

const GRANT: CommandToolGrant = {
  id: "grant-1",
  source: "command",
  commandId: "command-1",
  pinned: [],
};

function renderView(grant: CommandToolGrant, overrides: Partial<Parameters<typeof GrantView>[0]> = {}) {
  const onGrantChange = vi.fn();
  const onBack = vi.fn();

  render(
    <GrantView
      agentName="EDITOR"
      grant={grant}
      command={COMMAND}
      onGrantChange={onGrantChange}
      onBack={onBack}
      onSave={async () => {}}
      {...overrides}
    />,
  );

  return {
    onGrantChange,
    onBack,
  };
}

describe("GrantView", () => {
  it("says whose grant this is and what the function does", () => {
    renderView(GRANT);

    expect(screen.getByText("EDITOR · run_tests")).toBeInTheDocument();
    // The description shows twice: under the step's title and in the schema the model reads.
    expect(screen.getAllByText("Прогнати тести проєкту й повернути звіт")).toHaveLength(2);
  });

  it("leaves every parameter to the model while nothing is pinned", () => {
    renderView(GRANT);

    expect(screen.getByText("ВИРІШУЄ МОДЕЛЬ")).toBeInTheDocument();
    expect(screen.queryByText(/ЗАКРІПЛЕНО ЗА/)).not.toBeInTheDocument();
    expect(screen.getAllByText("ЗАКРІПИТИ")).toHaveLength(2);
  });

  it("fixes a parameter with nothing in it, for the value to be typed on the row", () => {
    const { onGrantChange } = renderView(GRANT);

    fireEvent.click(screen.getAllByText("ЗАКРІПИТИ")[0]);

    expect(onGrantChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pinned: [
          expect.objectContaining({
            parameterId: "parameter-1",
            value: "",
          }),
        ],
      }),
    );
  });

  it("takes a pinned parameter out of what the model is handed", () => {
    renderView({
      ...GRANT,
      pinned: [
        {
          id: "pinned-1",
          parameterId: "parameter-1",
          value: "auth/*.spec.ts",
        },
      ],
    });

    expect(screen.getByText("ЗАКРІПЛЕНО ЗА EDITOR")).toBeInTheDocument();
    expect(screen.getByDisplayValue("auth/*.spec.ts")).toBeInTheDocument();
    expect(screen.getAllByText("ЗАКРІПИТИ")).toHaveLength(1);
    // A fixed argument shows once and leaves the model's schema; an open one shows in the list and the schema.
    expect(screen.getAllByText("pattern")).toHaveLength(1);
    expect(screen.getAllByText("timeout")).toHaveLength(2);
  });

  it("hands the parameter back to the model, and the value goes with it", () => {
    const { onGrantChange } = renderView({
      ...GRANT,
      pinned: [
        {
          id: "pinned-1",
          parameterId: "parameter-1",
          value: "auth/*.spec.ts",
        },
      ],
    });

    fireEvent.click(screen.getByLabelText("Відкріпити pattern"));

    expect(onGrantChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pinned: [],
      }),
    );
  });

  it("carries one act only — taking the grant back is the tick in the list, not a second way here", () => {
    const { onBack } = renderView(GRANT);

    expect(screen.queryByText("Забрати")).not.toBeInTheDocument();
    expect(screen.getByText("Зберегти")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Назад до налаштувань"));

    expect(onBack).toHaveBeenCalled();
  });

  it("says so plainly when the command behind the grant is gone, having nothing to fix", () => {
    renderView(GRANT, {
      command: null,
    });

    expect(screen.getByText("Команди, з якої зроблено видачу, у проєкті немає")).toBeInTheDocument();
    expect(screen.queryByText("ВИРІШУЄ МОДЕЛЬ")).not.toBeInTheDocument();
  });
});
