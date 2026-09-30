import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Field } from "./field";

const LABEL = "ВХІДНА · $/1M";

/** The field is controlled: what it refuses never reaches the value. */
function TypedField({ type }: { type: "text" | "number" }) {
  const [value, setValue] = useState("");

  return <Field label={LABEL} type={type} value={value} onChange={setValue} />;
}

describe("Field", () => {
  it("takes nothing below zero in a number field", async () => {
    const user = userEvent.setup();

    render(<TypedField type="number" />);
    await user.type(screen.getByLabelText(LABEL), "-1.5");

    // The minus never goes in.
    expect(screen.getByLabelText(LABEL)).toHaveValue(1.5);
  });

  it("stands at zero at the lowest, so the arrows cannot go under", () => {
    render(<TypedField type="number" />);

    expect(screen.getByLabelText(LABEL)).toHaveAttribute("min", "0");
  });

  it("leaves a minus alone in a field of words", async () => {
    const user = userEvent.setup();

    render(<TypedField type="text" />);
    await user.type(screen.getByLabelText(LABEL), "-1.5");

    expect(screen.getByLabelText(LABEL)).toHaveValue("-1.5");
  });

  it("keeps the system dictionary off a field that holds a name or a line, and on one that holds prose", () => {
    const { rerender } = render(<Field label={LABEL} value="npm test -- {pattern}" onChange={() => {}} />);

    // Spellcheck is off: «npm» is not a misspelling.
    expect(screen.getByLabelText(LABEL)).toHaveAttribute("spellcheck", "false");

    rerender(<Field label={LABEL} value="Прогнати тести проєкту" isProse onChange={() => {}} />);

    expect(screen.getByLabelText(LABEL)).toHaveAttribute("spellcheck", "true");
  });
});
