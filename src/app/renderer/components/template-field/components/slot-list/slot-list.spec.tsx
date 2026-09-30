import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SlotList } from "./slot-list";
import { TEMPLATE_FIELD_LIST_EMPTY_LABEL, TEMPLATE_FIELD_OPTION_USED_LABEL } from "../../constants";
import type { ListWalk } from "../../../../hooks";
import type { TemplateSlot } from "../../interfaces";

const walk: ListWalk = {
  walked: -1,
  walkTo: () => {},
  onKeyDown: () => {},
  walkedRow: () => {},
};

function slot(patch: Partial<TemplateSlot> = {}): TemplateSlot {
  return {
    name: "branch",
    type: "text",
    isUsed: false,
    ...patch,
  };
}

describe("SlotList", () => {
  it("offers the declared names with what each may hold", () => {
    // «{» offers the declared names.
    render(<SlotList offered={[slot()]} walk={walk} onPick={() => {}} />);

    expect(screen.getByRole("option")).toHaveTextContent("branch");
    expect(screen.getByText("text")).toBeInTheDocument();
  });

  it("says in a word where there is nothing to offer", () => {
    render(<SlotList offered={[]} walk={walk} onPick={() => {}} />);

    expect(screen.getByText(TEMPLATE_FIELD_LIST_EMPTY_LABEL)).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("marks a name the line already writes, so it is not put in twice by mistake", () => {
    render(
      <SlotList
        offered={[
          slot({
            isUsed: true,
          }),
        ]}
        walk={walk}
        onPick={() => {}}
      />,
    );

    expect(screen.getByText(TEMPLATE_FIELD_OPTION_USED_LABEL)).toBeInTheDocument();
    expect(screen.getByRole("option")).toHaveAttribute("aria-selected", "true");
  });

  it("hands back the name that was picked", async () => {
    const onPick = vi.fn();

    render(
      <SlotList
        offered={[
          slot(),
          slot({
            name: "draft",
          }),
        ]}
        walk={walk}
        onPick={onPick}
      />,
    );
    await userEvent.click(screen.getByText("draft"));

    expect(onPick).toHaveBeenCalledWith("draft");
  });

  it("keeps the field's own focus, so the letters go on being typed while the list stands", () => {
    // Arrows walk the names while the line stays the thing being written.
    const { container } = render(<SlotList offered={[slot()]} walk={walk} onPick={() => {}} />);
    const list = container.querySelector('[role="listbox"]');
    const held = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });

    list?.dispatchEvent(held);

    expect(held.defaultPrevented).toBe(true);
  });
});
