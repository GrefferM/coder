import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SlotBackdrop } from "./slot-backdrop";
import { TEMPLATE_FIELD_SLOT_COLOR } from "../../constants";

describe("SlotBackdrop", () => {
  it("paints the declared names of a line and leaves the rest of it plain", () => {
    // Glyphs of the field are transparent, so the backdrop shows what is a slot while typing.
    const { container } = render(<SlotBackdrop value="gh pr create --base {branch}" isSlot={(part) => part.isSlot} />);
    const [plain, slot] = Array.from(container.querySelectorAll("span"));

    expect(plain).toHaveTextContent("gh pr create --base");
    expect(plain.style.color).toBe("");
    expect(slot).toHaveTextContent("{branch}");
    expect(slot).toHaveStyle({
      color: TEMPLATE_FIELD_SLOT_COLOR,
    });
  });

  it("leaves a name in braces unpainted where the caller says it is no slot", () => {
    // With parameters declared only real names are slots; without, every name is.
    const { container } = render(<SlotBackdrop value="echo {nothing}" isSlot={() => false} />);

    for (const part of Array.from(container.querySelectorAll("span"))) {
      expect(part.style.color).toBe("");
    }

    expect(screen.getByText("{nothing}")).toBeInTheDocument();
  });
});
