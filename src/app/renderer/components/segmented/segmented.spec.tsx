import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Segmented } from "./segmented";

const OPTIONS = [
  {
    value: "number" as const,
    label: "Число",
  },
  {
    value: "text" as const,
    label: "Текст",
  },
];

describe("Segmented", () => {
  it("stands every way on the screen at once, with one of them chosen", () => {
    render(<Segmented options={OPTIONS} value="text" onChange={() => {}} />);

    expect(
      screen.getByRole("radio", {
        name: "Число",
      }),
    ).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByRole("radio", {
        name: "Текст",
      }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("reports the way that was pressed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Segmented options={OPTIONS} value="text" onChange={onChange} />);
    await user.click(
      screen.getByRole("radio", {
        name: "Число",
      }),
    );

    expect(onChange).toHaveBeenCalledWith("number");
  });
});
