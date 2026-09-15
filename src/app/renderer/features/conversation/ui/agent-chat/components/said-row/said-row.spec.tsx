import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SaidRow } from "./said-row";
import { SAID_ROW_AGAIN_LABEL, SAID_ROW_COLOR } from "./constants";

describe("SaidRow", () => {
  it("says the app's own words on the rule, in the app's own voice", () => {
    render(<SaidRow words="Відповідь не прийшла" />);

    const words = screen.getByText("Відповідь не прийшла");

    // No agent's colour, so nobody can mistake it for somebody speaking.
    expect(words).toHaveStyle({
      color: SAID_ROW_COLOR,
    });
    expect(words).toHaveClass("font-monospace", "text-uppercase");
  });

  it("offers no repeat where the stream gave it none to offer", () => {
    render(<SaidRow words="Відповідь не прийшла" />);

    expect(screen.queryByText(SAID_ROW_AGAIN_LABEL)).not.toBeInTheDocument();
  });

  it("stands the repeat under the sentence it answers", () => {
    const onAskAgain = vi.fn();

    render(<SaidRow words="Модель не сказала нічого" onAskAgain={onAskAgain} />);

    // The act belongs to the sentence over it — the turn happened, and nothing was said.
    screen.getByText(SAID_ROW_AGAIN_LABEL).click();
    expect(onAskAgain).toHaveBeenCalledTimes(1);
  });
});
