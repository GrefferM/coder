import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OpenedBand } from "./opened-band";
import { AGENT_CHAT_OPENED_DOT_COLORS, AGENT_CHAT_OPENED_EMPTY_DOT_BORDER } from "../../constants";
import { RUN_NOT_SENT, RUN_STATE_LABELS } from "../../../../../record";
import { dayLabel, timeLabel } from "../../../../../../utils/dates";
import type { ChatHead } from "../../interfaces";

const AT = new Date(2026, 8, 4, 14, 5);

function head(patch: Partial<ChatHead> = {}): ChatHead {
  return {
    at: AT,
    state: "done",
    isOpened: true,
    isFailed: false,
    ...patch,
  };
}

describe("OpenedBand", () => {
  it("names the state of the flow in the words the row of the history names it in, and when it last spoke", () => {
    // The person comes here by pressing a row that names the state outright, and two namings of one flow read
    // as two, so the band says it in the row's own words.
    render(<OpenedBand head={head()} />);

    expect(screen.getByText(RUN_STATE_LABELS.done)).toBeInTheDocument();
    expect(screen.getByText(`${dayLabel(AT, new Date())} ${timeLabel(AT)}`)).toBeInTheDocument();
  });

  it("says the fifth word too, and draws its dot as an empty place", () => {
    // Nothing was sent, so the dot has no colour to carry — the outline says the place is empty.
    const { container } = render(
      <OpenedBand
        head={head({
          state: RUN_NOT_SENT,
        })}
      />,
    );

    expect(screen.getByText(RUN_STATE_LABELS.notSent)).toBeInTheDocument();
    expect(container.querySelector('[style*="border-radius: 50%"]')).toHaveStyle({
      border: AGENT_CHAT_OPENED_EMPTY_DOT_BORDER,
    });
  });

  it("says how the run ended by the colour of one dot", () => {
    const { container, rerender } = render(<OpenedBand head={head()} />);

    expect(container.querySelector('[style*="border-radius: 50%"]')).toHaveStyle({
      background: AGENT_CHAT_OPENED_DOT_COLORS.done,
    });

    rerender(
      <OpenedBand
        head={head({
          state: "failed",
        })}
      />,
    );

    expect(container.querySelector('[style*="border-radius: 50%"]')).toHaveStyle({
      background: AGENT_CHAT_OPENED_DOT_COLORS.failed,
    });
  });
});
