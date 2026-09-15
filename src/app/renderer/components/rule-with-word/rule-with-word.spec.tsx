import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RuleWithWord } from "./rule-with-word";
import { HAIRLINE_COLOR, QUIET_MARK_COLOR } from "../../constants";

describe("RuleWithWord", () => {
  it("carries its word between two halves of one rule", () => {
    const { container } = render(<RuleWithWord>СЬОГОДНІ</RuleWithWord>);

    const halves = container.querySelectorAll(".flex-fill");

    expect(halves).toHaveLength(2);
    expect(halves[0]).toHaveStyle({
      height: "1px",
      background: HAIRLINE_COLOR,
    });
    expect(screen.getByText("СЬОГОДНІ")).toHaveStyle({
      color: QUIET_MARK_COLOR,
    });
  });

  it("takes the tone of what it announces", () => {
    render(<RuleWithWord color="#5c6478">НОВИЙ ЗАПИТ</RuleWithWord>);

    expect(screen.getByText("НОВИЙ ЗАПИТ")).toHaveStyle({
      color: "#5c6478",
    });
  });
});
