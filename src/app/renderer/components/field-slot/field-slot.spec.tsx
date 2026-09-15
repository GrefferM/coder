import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldSlot } from "./field-slot";
import { FIELD_SLOT_WAS_PREFIX } from "./constants";

describe("FieldSlot", () => {
  it("names what stands in it, and stands it under the name", () => {
    render(
      <FieldSlot label="МОДЕЛЬ">
        <button type="button">claude-sonnet-4.5</button>
      </FieldSlot>,
    );

    expect(screen.getByText("МОДЕЛЬ")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("claude-sonnet-4.5");
  });

  it("ties its name to a field of its own where there is one to tie it to", () => {
    // A name tied to its field means a press on the name reaches the field, which a bare span cannot do.
    render(
      <FieldSlot label="ІМʼЯ" htmlFor="agent-name">
        <input id="agent-name" />
      </FieldSlot>,
    );

    expect(screen.getByLabelText("ІМʼЯ")).toBe(screen.getByRole("textbox"));
  });

  it("says what the field was while the draft has moved it", () => {
    // The dot at the name and «БУЛО · …» under the field, together.
    render(
      <FieldSlot label="МОДЕЛЬ" wasValue="claude-haiku-4.5">
        <button type="button">claude-sonnet-4.5</button>
      </FieldSlot>,
    );

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}claude-haiku-4.5`)).toBeInTheDocument();
  });

  it("stands an act of its own at the name's right edge", () => {
    // The act belongs to the slot, not to the field — «+ ДОДАТИ» beside the label.
    render(
      <FieldSlot label="ЗНАРЯДДЯ" action={<button type="button">+ ДОДАТИ</button>}>
        <span>нічого</span>
      </FieldSlot>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("+ ДОДАТИ");
  });
});
