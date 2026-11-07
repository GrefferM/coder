import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runnableSchedules } from "./runnable-schedules";
import { aConfig, anAgent } from "../../../utils/testing";
import type { ProjectSchedule } from "../../../contracts";

const AGENT = anAgent({
  id: "agent-1",
});

function aSchedule(patch: Partial<ProjectSchedule> = {}): ProjectSchedule {
  return {
    id: "schedule-1",
    agentId: "agent-1",
    task: "Перевір main.",
    everyMinutes: 30,
    ...patch,
  };
}

function runnableOf(schedule: ProjectSchedule, switchedOn = new Set(["schedule-1"])): string[] {
  const config = aConfig({
    agents: [AGENT],
    schedules: [schedule],
  });

  return runnableSchedules(config, switchedOn).map((runnable) => runnable.scheduleId);
}

describe("runnableSchedules", () => {
  it("runs a schedule switched on here, with its agent, task and interval in milliseconds", () => {
    const config = aConfig({
      agents: [AGENT],
      schedules: [aSchedule()],
    });

    assert.deepEqual(runnableSchedules(config, new Set(["schedule-1"])), [
      {
        scheduleId: "schedule-1",
        agent: AGENT,
        task: "Перевір main.",
        everyMs: 1_800_000,
      },
    ]);
  });

  it("leaves out a schedule this machine never switched on", () => {
    assert.deepEqual(runnableOf(aSchedule(), new Set()), []);
  });

  it("leaves out a schedule whose agent is gone, rather than putting the task to another", () => {
    assert.deepEqual(
      runnableOf(
        aSchedule({
          agentId: "agent-gone",
        }),
      ),
      [],
    );
  });

  it("leaves out a schedule with no agent chosen", () => {
    assert.deepEqual(
      runnableOf(
        aSchedule({
          agentId: null,
        }),
      ),
      [],
    );
  });

  it("leaves out a schedule whose task is not written or is only spaces", () => {
    assert.deepEqual(
      runnableOf(
        aSchedule({
          task: null,
        }),
      ),
      [],
    );
    assert.deepEqual(
      runnableOf(
        aSchedule({
          task: "  ",
        }),
      ),
      [],
    );
  });

  it("leaves out a schedule whose interval is not written", () => {
    assert.deepEqual(
      runnableOf(
        aSchedule({
          everyMinutes: null,
        }),
      ),
      [],
    );
  });
});
