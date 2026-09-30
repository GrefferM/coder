import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ForgetRunConfirm } from "./forget-run-confirm";
import { FORGET_RUN_NOTE_PREFIX, FORGET_RUN_NOTE_SUFFIX, FORGET_RUN_QUESTION } from "./constants";
import { dayLabel, timeLabel } from "../../../../utils/dates";
import { CONFIRM_DIALOG_YES_LABEL } from "../../../../components/confirm-dialog/constants";
import { RUN_DONE } from "../../constants";
import type { RunRow } from "../../interfaces";

const STARTED_AT = new Date(2026, 8, 4, 14, 5);

const run: RunRow = {
  id: "run-1",
  startedByAgentId: "agent-1",
  startedByAgentName: "Шукач",
  startedByAgentColor: "#6fd3d8",
  askedAgentId: "agent-1",
  askedAgentName: "Шукач",
  asked: "Знайди md-файли",
  state: RUN_DONE,
  startedAt: STARTED_AT,
  askedAt: STARTED_AT,
  endedAt: STARTED_AT,
  steps: 2,
  money: 0.0031,
  worked: 5_500,
};

describe("ForgetRunConfirm", () => {
  it("asks before the one deletion that has no way back, and says which run it is", () => {
    // Forgetting a run asks first.
    render(<ForgetRunConfirm run={run} onConfirm={() => {}} onDismiss={() => {}} />);

    expect(screen.getByText(FORGET_RUN_QUESTION)).toBeInTheDocument();

    const when = `${dayLabel(STARTED_AT, new Date())} ${timeLabel(STARTED_AT)}`;

    expect(screen.getByText(`${FORGET_RUN_NOTE_PREFIX}${when}${FORGET_RUN_NOTE_SUFFIX}`)).toBeInTheDocument();
  });

  it("deletes on the yes and lets it be on the no", async () => {
    const onConfirm = vi.fn();
    const onDismiss = vi.fn();

    render(<ForgetRunConfirm run={run} onConfirm={onConfirm} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByText(CONFIRM_DIALOG_YES_LABEL));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
