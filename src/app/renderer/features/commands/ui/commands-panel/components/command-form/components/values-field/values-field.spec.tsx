import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ValuesField } from "./values-field";
import {
  VALUES_FIELD_LABEL,
  VALUES_FIELD_NOTE,
  VALUES_FIELD_PLACEHOLDER,
  VALUES_FIELD_REMOVE_LABEL,
} from "./constants";

describe("ValuesField", () => {
  it("stands every allowed value as its own chip, and says what Enter does", () => {
    // An enum is a closed list, so each value is a thing that can be taken away by itself.
    render(<ValuesField values={["dot", "tree"]} onChange={() => {}} />);

    expect(screen.getByText(VALUES_FIELD_LABEL)).toBeInTheDocument();
    expect(screen.getByText("dot")).toBeInTheDocument();
    expect(screen.getByText("tree")).toBeInTheDocument();
    expect(screen.getByText(VALUES_FIELD_NOTE)).toBeInTheDocument();
  });

  it("adds what was typed on Enter", async () => {
    const onChange = vi.fn();

    render(<ValuesField values={["dot"]} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(VALUES_FIELD_LABEL), "tree{Enter}");

    expect(onChange).toHaveBeenCalledWith(["dot", "tree"]);
  });

  it("adds nothing blank, and nothing it already holds", async () => {
    const onChange = vi.fn();

    render(<ValuesField values={["dot"]} onChange={onChange} />);

    const field = screen.getByLabelText(VALUES_FIELD_LABEL);

    await userEvent.type(field, "   {Enter}");

    expect(onChange).not.toHaveBeenCalled();

    await userEvent.type(field, "dot{Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("takes what was typed when the field is left, so a value is not lost by looking away", async () => {
    const onChange = vi.fn();

    render(<ValuesField values={[]} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(VALUES_FIELD_LABEL), "tree");
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(["tree"]);
  });

  it("takes a value away by its own cross", async () => {
    const onChange = vi.fn();

    render(<ValuesField values={["dot", "tree"]} onChange={onChange} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: `${VALUES_FIELD_REMOVE_LABEL} dot`,
      }),
    );

    expect(onChange).toHaveBeenCalledWith(["tree"]);
  });

  it("shows what a value looks like only while it holds none", () => {
    const { rerender } = render(<ValuesField values={[]} onChange={() => {}} />);

    expect(screen.getByPlaceholderText(VALUES_FIELD_PLACEHOLDER)).toBeInTheDocument();

    rerender(<ValuesField values={["dot"]} onChange={() => {}} />);

    expect(screen.queryByPlaceholderText(VALUES_FIELD_PLACEHOLDER)).not.toBeInTheDocument();
  });
});
