import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TroublePill } from "./trouble-pill";
import { SPHERE_TROUBLE_BREAK_COLOR, SPHERE_TROUBLE_FACT_COLOR } from "../../constants";

describe("TroublePill", () => {
  it("says under the name, in a word, what is missing", () => {
    render(<TroublePill label="НЕМАЄ МОДЕЛІ" isBreak />);

    expect(screen.getByText("НЕМАЄ МОДЕЛІ")).toBeInTheDocument();
  });

  it("takes the same two colours the mark on the ring takes", () => {
    // The ring and the pill say one thing, so they must never disagree about which it is.
    const { rerender } = render(<TroublePill label="НЕМАЄ МОДЕЛІ" isBreak />);

    expect(screen.getByText("НЕМАЄ МОДЕЛІ")).toHaveStyle({
      color: SPHERE_TROUBLE_BREAK_COLOR,
    });

    rerender(<TroublePill label="НЕМАЄ ПРОМПТА" isBreak={false} />);

    expect(screen.getByText("НЕМАЄ ПРОМПТА")).toHaveStyle({
      color: SPHERE_TROUBLE_FACT_COLOR,
    });
  });
});
