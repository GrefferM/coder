import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RailButton } from "./rail-button";
import { COLLAPSE_LABEL } from "../../constants";

describe("RailButton", () => {
  it("is named by the section it opens", () => {
    render(<RailButton glyph={null} label="Агенти" isActive={false} side="right" onSelect={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: "Агенти",
      }),
    ).toBeInTheDocument();
  });

  it("says «згорнути панель» once its own section stands open, since that is what a press does then", () => {
    // The open section's button closes it, and says so.
    render(<RailButton glyph={null} label="Агенти" isActive side="right" onSelect={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: COLLAPSE_LABEL,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Агенти",
      }),
    ).not.toBeInTheDocument();
  });

  it("shows its name under the pointer, opening inwards from the window's edge", async () => {
    const { rerender } = render(
      <RailButton glyph={null} label="Агенти" isActive={false} side="right" onSelect={() => {}} />,
    );

    await userEvent.hover(screen.getByRole("button"));

    expect(screen.getByText("Агенти")).toHaveStyle({
      position: "absolute",
    });

    rerender(<RailButton glyph={null} label="Агенти" isActive={false} side="left" onSelect={() => {}} />);

    // The tooltip opens inwards, away from the window edge.
    expect(screen.getByText("Агенти").style.left).not.toBe("");
  });

  it("goes to its section on a press", async () => {
    const onSelect = vi.fn();

    render(<RailButton glyph={null} label="Агенти" isActive={false} side="right" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledOnce();
  });
});
