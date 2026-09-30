import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SaidBlock } from "./said-block";
import { STEP_SHEET_ANSWER_COLOR, STEP_SHEET_TAKEN_COLOR } from "../../constants";

describe("SaidBlock", () => {
  it("names the block and stands its words under that name", () => {
    render(<SaidBlock label="ВІДПОВІВ" text="ЗНАЙДЕНО report.md" isAnswer />);

    expect(screen.getByText("ВІДПОВІВ")).toBeInTheDocument();
    expect(screen.getByText("ЗНАЙДЕНО report.md")).toBeInTheDocument();
  });

  it("stands the turn's own words bright and what came into it quieter", () => {
    // One is this step's own words, the other is another's carried in.
    const { rerender } = render(<SaidBlock label="ВІДПОВІВ" text="ЗНАЙДЕНО" isAnswer />);

    expect(screen.getByText("ЗНАЙДЕНО")).toHaveStyle({
      color: STEP_SHEET_ANSWER_COLOR,
    });

    rerender(<SaidBlock label="ПРИЙНЯВ" text="Знайди md-файли" isAnswer={false} />);

    expect(screen.getByText("Знайди md-файли")).toHaveStyle({
      color: STEP_SHEET_TAKEN_COLOR,
    });
  });
});
