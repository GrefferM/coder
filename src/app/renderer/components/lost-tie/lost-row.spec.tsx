import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LostRow } from "./lost-row";

describe("LostRow", () => {
  it("names what the tie still points at, and strikes it through", () => {
    // The tie is not cleared for the person — it stands, crossed out, until they deal with it.
    render(<LostRow name="моделі немає" />);

    expect(screen.getByText("моделі немає")).toHaveStyle({
      textDecoration: "line-through",
    });
  });

  it("carries whatever the tie still holds beside the name", () => {
    render(
      <LostRow name="функції немає">
        <span>3</span>
      </LostRow>,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
