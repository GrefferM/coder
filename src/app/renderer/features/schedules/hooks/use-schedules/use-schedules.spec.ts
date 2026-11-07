import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSchedules } from "./use-schedules";
import {
  FOLLOW_SCHEDULES_CHANNEL,
  SCHEDULE_STANDINGS_CHANNEL,
  SWITCH_SCHEDULE_CHANNEL,
} from "../../../../../../contracts";
import { aConfig, standInBridge } from "../../../../testing";
import type { OpenProject, ScheduleStanding } from "../../../../interfaces";

const PROJECT: OpenProject = {
  directory: "/work/coder",
  config: aConfig(),
  print: "print-1",
  view: null,
};
const STANDING: ScheduleStanding = {
  scheduleId: "schedule-1",
  isOn: true,
  nextAt: 1_000,
  outSince: null,
};

/** The machine's clock, answering the standings and keeping every call. */
function machine() {
  const calls: Array<[string, unknown]> = [];
  const invoke = vi.fn(async (channel: string, payload: unknown) => {
    calls.push([channel, payload]);

    return channel === SCHEDULE_STANDINGS_CHANNEL ? [STANDING] : undefined;
  });

  standInBridge({
    invoke,
  });

  return calls;
}

describe("useSchedules", () => {
  it("hands the clock the open project, and reads back how each schedule stands", async () => {
    const calls = machine();

    const { result } = renderHook(() => useSchedules(PROJECT));

    await waitFor(() => expect(result.current.standings["schedule-1"]).toEqual(STANDING));
    expect(calls[0]).toEqual([
      FOLLOW_SCHEDULES_CHANNEL,
      {
        directory: "/work/coder",
        config: PROJECT.config,
      },
    ]);
  });

  it("switches a schedule on this machine and reads the standings again", async () => {
    const calls = machine();
    const { result } = renderHook(() => useSchedules(PROJECT));

    await act(async () => {
      await result.current.switchOn("schedule-1", true);
    });

    const switchAt = calls.findIndex(([channel]) => channel === SWITCH_SCHEDULE_CHANNEL);

    expect(calls[switchAt][1]).toEqual({
      scheduleId: "schedule-1",
      isOn: true,
    });
    expect(calls.slice(switchAt).some(([channel]) => channel === SCHEDULE_STANDINGS_CHANNEL)).toBe(true);
  });
});
