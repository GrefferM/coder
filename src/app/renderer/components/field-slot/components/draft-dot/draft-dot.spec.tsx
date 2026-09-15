import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DraftDot } from "./draft-dot";
import { FIELD_SLOT_DOT_COLOR, FIELD_SLOT_DOT_SIZE_PX } from "../../constants";

describe("DraftDot", () => {
  it("is the accent dot beside a field the draft has moved", () => {
    // The first of the three marks, and the one that stands beside the field's own name.
    const { container } = render(<DraftDot />);

    expect(container.firstElementChild).toHaveStyle({
      width: `${FIELD_SLOT_DOT_SIZE_PX}px`,
      height: `${FIELD_SLOT_DOT_SIZE_PX}px`,
      borderRadius: "50%",
      background: FIELD_SLOT_DOT_COLOR,
    });
  });
});
