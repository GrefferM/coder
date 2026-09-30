import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OpenedBand } from "./opened-band";
import {
  AGENT_CHAT_OPENED_DOT_COLORS,
  AGENT_CHAT_OPENED_EMPTY_DOT_BORDER,
  AGENT_CHAT_OPENED_EXPORT_LABEL,
} from "../../constants";
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
    // The band uses the same words as the history row (`RUN_STATE_LABELS`).
    render(<OpenedBand head={head()} onExport={null} />);

    expect(screen.getByText(RUN_STATE_LABELS.done)).toBeInTheDocument();
    expect(screen.getByText(`${dayLabel(AT, new Date())} ${timeLabel(AT)}`)).toBeInTheDocument();
  });

  it("says the fifth word too, and draws its dot as an empty place", () => {
    // Nothing was sent: the dot has no colour, only an outline.
    const { container } = render(
      <OpenedBand
        head={head({
          state: RUN_NOT_SENT,
        })}
        onExport={null}
      />,
    );

    expect(screen.getByText(RUN_STATE_LABELS.notSent)).toBeInTheDocument();
    expect(container.querySelector('[style*="border-radius: 50%"]')).toHaveStyle({
      border: AGENT_CHAT_OPENED_EMPTY_DOT_BORDER,
    });
  });

  it("says how the run ended by the colour of one dot", () => {
    const { container, rerender } = render(<OpenedBand head={head()} onExport={null} />);

    expect(container.querySelector('[style*="border-radius: 50%"]')).toHaveStyle({
      background: AGENT_CHAT_OPENED_DOT_COLORS.done,
    });

    rerender(
      <OpenedBand
        head={head({
          state: "failed",
        })}
        onExport={null}
      />,
    );

    expect(container.querySelector('[style*="border-radius: 50%"]')).toHaveStyle({
      background: AGENT_CHAT_OPENED_DOT_COLORS.failed,
    });
  });
  it("stands its own act on the right, and calls it when pressed", () => {
    const onExport = vi.fn();

    render(<OpenedBand head={head()} onExport={onExport} />);
    fireEvent.click(screen.getByText(AGENT_CHAT_OPENED_EXPORT_LABEL));

    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it("keeps the act off where there is nothing on screen to write out", () => {
    render(<OpenedBand head={head()} onExport={null} />);

    expect(screen.queryByText(AGENT_CHAT_OPENED_EXPORT_LABEL)).not.toBeInTheDocument();
  });
});
