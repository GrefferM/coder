import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListAction } from "./list-action";

describe("ListAction", () => {
  it("stands in the list as one of its rows, so the walk counts it in", () => {
    render(<ListAction label="Новий проєкт" onSelect={() => {}} />);

    expect(screen.getByRole("menuitem")).toHaveTextContent("Новий проєкт");
  });

  it("does its act on a press", async () => {
    const onSelect = vi.fn();

    render(<ListAction label="Відкрити папку…" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("menuitem"));

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("takes the measures the quieter rows are given", () => {
    // «Показати у Finder» stands apart, smaller and tighter than the acts above it.
    render(<ListAction label="Показати у Finder" onSelect={() => {}} padding="4px 10px" fontSize={11} />);

    expect(screen.getByRole("menuitem")).toHaveStyle({
      padding: "4px 10px",
      fontSize: "11px",
    });
  });
});
