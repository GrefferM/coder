import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModelPreview } from "./model-preview";
import { MODEL_PREVIEW_LABEL, MODEL_PREVIEW_OPTIONAL_MARK } from "./constants";
import type { CommandParameter } from "../../interfaces";

function parameter(patch: Partial<CommandParameter> = {}): CommandParameter {
  return {
    id: "parameter-1",
    name: "branch",
    type: "text",
    description: "Гілка, на яку відкривати PR",
    isRequired: true,
    values: [],
    ...patch,
  };
}

describe("ModelPreview", () => {
  it("shows the command as the model will see it — its name, what it does, and its parameters", () => {
    render(
      <ModelPreview
        name="open_pr"
        description="Відкриває pull request"
        parameters={[parameter()]}
        note="Так її оголошено"
      />,
    );

    expect(screen.getByText(MODEL_PREVIEW_LABEL)).toBeInTheDocument();
    expect(screen.getByText("open_pr")).toBeInTheDocument();
    expect(screen.getByText("branch")).toBeInTheDocument();
    expect(screen.getByText("Гілка, на яку відкривати PR")).toBeInTheDocument();
  });

  it("marks an optional parameter as one, and leaves a required one unmarked", () => {
    render(
      <ModelPreview
        name="open_pr"
        description=""
        parameters={[
          parameter(),
          parameter({
            id: "parameter-2",
            name: "draft",
            isRequired: false,
          }),
        ]}
        note=""
      />,
    );

    expect(screen.getByText("text")).toBeInTheDocument();
    expect(screen.getByText(`text${MODEL_PREVIEW_OPTIONAL_MARK}`)).toBeInTheDocument();
  });

  it("says its own word under the box, since the same preview stands in two places", () => {
    // As declared in the catalogue, and per agent with the fixed parameters taken out.
    render(<ModelPreview name="open_pr" description="" parameters={[]} note="Закріплені параметри тут не стоять" />);

    expect(screen.getByText("Закріплені параметри тут не стоять")).toBeInTheDocument();
  });
});
