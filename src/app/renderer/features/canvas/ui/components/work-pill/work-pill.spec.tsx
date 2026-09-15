import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkPill } from "./work-pill";
import { WORK_PILL_LABEL } from "./constants";

describe("WorkPill", () => {
  it("says how long the turn has been out, counted from when it was sent", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 18, 12, 0, 12));

    render(<WorkPill startedAt={new Date(2026, 7, 18, 12, 0, 0).getTime()} />);

    expect(screen.getByText(new RegExp(`${WORK_PILL_LABEL} · 00:12`, "i"))).toBeInTheDocument();

    vi.useRealTimers();
  });
});
