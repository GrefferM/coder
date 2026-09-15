import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OpenRow } from "./open-row";
import { OPEN_ROW_PIN_LABEL } from "./constants";
import type { CommandParameter } from "../../../../../../../../../../interfaces";

const parameter: CommandParameter = {
  id: "parameter-1",
  name: "branch",
  type: "text",
  description: "Гілка, на яку відкривати PR",
  isRequired: true,
  values: [],
};

describe("OpenRow", () => {
  it("names a parameter the model decides, and what it may hold", () => {
    render(<OpenRow parameter={parameter} onPin={() => {}} />);

    expect(screen.getByText("branch")).toBeInTheDocument();
    expect(screen.getByText("text")).toBeInTheDocument();
  });

  it("offers to fix it for this agent", async () => {
    // A fixed argument leaves the model's schema, so the row is where that is decided.
    const onPin = vi.fn();

    render(<OpenRow parameter={parameter} onPin={onPin} />);
    await userEvent.click(screen.getByText(OPEN_ROW_PIN_LABEL));

    expect(onPin).toHaveBeenCalledOnce();
  });
});
