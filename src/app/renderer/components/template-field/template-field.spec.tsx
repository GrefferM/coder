import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TemplateField } from "./template-field";
import {
  TEMPLATE_FIELD_OPTION_TYPE_BACKGROUND_COLOR,
  TEMPLATE_FIELD_OPTION_USED_BACKGROUND_COLOR,
  TEMPLATE_FIELD_OPTION_USED_TYPE_BACKGROUND_COLOR,
  TEMPLATE_FIELD_SLOT_COLOR,
} from "./constants";

const LABEL = "КОМАНДА";

const SLOTS = [
  {
    name: "pattern",
    type: "text",
    isUsed: true,
  },
  {
    name: "bail",
    type: "bool",
    isUsed: false,
  },
];

/** The field is controlled: a caller that never writes back cannot be typed into. */
function TypedField({ slots }: { slots: { name: string; type: string; isUsed: boolean }[] }) {
  const [value, setValue] = useState("npm test ");

  return <TemplateField label={LABEL} value={value} onChange={setValue} slots={slots} />;
}

describe("TemplateField", () => {
  it("holds the line as it is typed, and reports every keystroke", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<TemplateField label={LABEL} value="npm" onChange={onChange} />);
    await user.type(screen.getByLabelText(LABEL), "!");

    expect(onChange).toHaveBeenCalledWith("npm!");
  });

  it("draws what braces stand in for apart from the rest of the line", () => {
    render(<TemplateField label={LABEL} value="npm test -- {pattern}" onChange={() => {}} />);

    const slot = screen.getByText("{pattern}");

    expect(slot).toHaveStyle({
      color: TEMPLATE_FIELD_SLOT_COLOR,
    });
    // The literal half carries no colour of its own.
    expect(
      screen.getByText("npm test --", {
        exact: false,
      }),
    ).not.toHaveStyle({
      color: TEMPLATE_FIELD_SLOT_COLOR,
    });
  });

  it("keeps the whole line in the backdrop, so nothing under the caret shifts", () => {
    const line = "  npm run {task} -- {flag}  ";
    const { container } = render(<TemplateField label={LABEL} value={line} onChange={() => {}} />);
    const backdrop = container.querySelector("[aria-hidden]");

    expect(backdrop?.textContent).toBe(line);
  });

  it("draws braces nobody declared as the text they are, and says nothing about them", () => {
    render(
      <TemplateField
        label={LABEL}
        value="npm test -- {pattern} --reporter={format}"
        onChange={() => {}}
        slots={SLOTS}
      />,
    );

    // A name no parameter answers to is not a slot; it goes to the shell as it stands.
    expect(screen.getByText("{format}")).not.toHaveStyle({
      color: TEMPLATE_FIELD_SLOT_COLOR,
    });
    expect(screen.getByText("{pattern}")).toHaveStyle({
      color: TEMPLATE_FIELD_SLOT_COLOR,
    });
  });

  it("draws what the shell owns as text, without a word about it", () => {
    render(<TemplateField label={LABEL} value="awk '{print $5}'" onChange={() => {}} slots={SLOTS} />);

    // No parameter answers to «print $5», so the braces are plain text: no pill, no note.
    expect(screen.getByText("{print $5}")).not.toHaveStyle({
      color: TEMPLATE_FIELD_SLOT_COLOR,
    });
  });

  it("offers the declared names when a brace is opened, saying which the line already carries", async () => {
    const user = userEvent.setup();

    render(<TypedField slots={SLOTS} />);
    await user.type(screen.getByLabelText(LABEL), "{{");

    expect(
      screen.getByRole("option", {
        name: /pattern/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("УЖЕ В РЯДКУ")).toBeInTheDocument();
  });

  it("lights the row already in the line, and steps its type up with it", async () => {
    const user = userEvent.setup();

    render(<TypedField slots={SLOTS} />);
    await user.type(screen.getByLabelText(LABEL), "{{");

    // A used row raises the row and its type chip.
    expect(
      screen.getByRole("option", {
        name: /pattern/,
      }),
    ).toHaveStyle({
      background: TEMPLATE_FIELD_OPTION_USED_BACKGROUND_COLOR,
    });
    expect(screen.getByText("text")).toHaveStyle({
      background: TEMPLATE_FIELD_OPTION_USED_TYPE_BACKGROUND_COLOR,
    });
    expect(screen.getByText("bool")).toHaveStyle({
      background: TEMPLATE_FIELD_OPTION_TYPE_BACKGROUND_COLOR,
    });
  });

  it("writes the chosen name into the brace that called the list up, closed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<TemplateField label={LABEL} value="npm test {" onChange={onChange} slots={SLOTS} />);
    await user.click(screen.getByLabelText(LABEL));
    await user.click(
      screen.getByRole("option", {
        name: /bail/,
      }),
    );

    expect(onChange).toHaveBeenCalledWith("npm test {bail}");
  });

  it("walks the offered names with the arrows and writes the one it stands on with Enter", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<TemplateField label={LABEL} value="npm test {" onChange={onChange} slots={SLOTS} />);
    await user.click(screen.getByLabelText(LABEL));
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith("npm test {bail}");
  });

  it("closes the list on Escape, leaving the line as it was", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<TemplateField label={LABEL} value="npm test {" onChange={onChange} slots={SLOTS} />);
    await user.click(screen.getByLabelText(LABEL));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("says the list is empty rather than standing empty, when nothing was declared", async () => {
    const user = userEvent.setup();

    render(<TypedField slots={[]} />);
    await user.type(screen.getByLabelText(LABEL), "{{");

    expect(screen.getByText("параметрів ще немає")).toBeInTheDocument();
  });
});
