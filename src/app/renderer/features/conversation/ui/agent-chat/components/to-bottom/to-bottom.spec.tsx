import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToBottom } from "./to-bottom";
import {
  AGENT_CHAT_TO_BOTTOM_LABEL,
  AGENT_CHAT_TO_BOTTOM_NEWS_BORDER_COLOR,
  AGENT_CHAT_TO_BOTTOM_NEWS_COLOR,
} from "../../constants";
import { newsLabel } from "../../../../words";

describe("ToBottom", () => {
  it("is a quiet arrow and says no number while nothing came", () => {
    render(<ToBottom news={0} onGo={() => {}} />);

    expect(screen.getByLabelText(AGENT_CHAT_TO_BOTTOM_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(/НОВ/)).not.toBeInTheDocument();
  });

  it("wears the number on itself rather than raising a second button", () => {
    render(<ToBottom news={3} onGo={() => {}} />);

    // Returning down and seeing the news is one act, so one button.
    expect(screen.getAllByLabelText(AGENT_CHAT_TO_BOTTOM_LABEL)).toHaveLength(1);
    expect(screen.getByText(newsLabel(3))).toBeInTheDocument();
  });

  it("takes the green of «іде» with a number, what came having come in a living stream", () => {
    render(<ToBottom news={3} onGo={() => {}} />);

    expect(screen.getByText(newsLabel(3))).toHaveStyle({
      color: AGENT_CHAT_TO_BOTTOM_NEWS_COLOR,
    });
    expect(screen.getByLabelText(AGENT_CHAT_TO_BOTTOM_LABEL)).toHaveStyle({
      border: `1px solid ${AGENT_CHAT_TO_BOTTOM_NEWS_BORDER_COLOR}`,
    });
  });

  it("takes the stream to its end when pressed", async () => {
    const onGo = vi.fn();
    const user = userEvent.setup();

    render(<ToBottom news={0} onGo={onGo} />);

    await user.click(screen.getByLabelText(AGENT_CHAT_TO_BOTTOM_LABEL));

    expect(onGo).toHaveBeenCalledTimes(1);
  });
});
