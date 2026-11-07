import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import { ScheduleClock } from "./schedule-clock.service";
import { aConfig, anAgent } from "../../../utils/testing";
import type { ProjectConfig, ProjectSchedule, ScheduledTask } from "../../../contracts";
import type { ScheduledAsker } from "../interfaces";

const MINUTE = 60_000;
const DIRECTORY = "/work/coder";

/** An asker that keeps what it was asked; a schedule is out while the spec says so. */
class RecordingAsker implements ScheduledAsker {
  readonly asked: ScheduledTask[] = [];
  readonly out = new Set<string>();

  ask(task: ScheduledTask): void {
    this.asked.push(task);
  }

  isOut(scheduleId: string): boolean {
    return this.out.has(scheduleId);
  }
}

function aSchedule(patch: Partial<ProjectSchedule> = {}): ProjectSchedule {
  return {
    id: "schedule-1",
    agentId: "agent-1",
    task: "Перевір main.",
    everyMinutes: 10,
    ...patch,
  };
}

function configWith(...schedules: ProjectSchedule[]): ProjectConfig {
  return aConfig({
    agents: [
      anAgent({
        id: "agent-1",
      }),
    ],
    schedules,
  });
}

describe("ScheduleClock", () => {
  let asker: RecordingAsker;
  let clock: ScheduleClock;

  beforeEach(() => {
    mock.timers.enable({
      apis: ["setTimeout", "Date"],
    });
    asker = new RecordingAsker();
    clock = new ScheduleClock(asker);
  });

  afterEach(() => {
    clock.stop();
    mock.timers.reset();
  });

  it("puts the task once a whole interval has passed, not the moment it is followed", () => {
    clock.follow({
      directory: DIRECTORY,
      config: configWith(aSchedule()),
      switchedOn: new Set(["schedule-1"]),
    });

    mock.timers.tick(10 * MINUTE - 1);

    assert.equal(asker.asked.length, 0);

    mock.timers.tick(1);

    assert.equal(asker.asked.length, 1);
    assert.equal(asker.asked[0].task, "Перевір main.");
    assert.equal(asker.asked[0].directory, DIRECTORY);
  });

  it("goes on putting it at every interval", () => {
    clock.follow({
      directory: DIRECTORY,
      config: configWith(aSchedule()),
      switchedOn: new Set(["schedule-1"]),
    });

    mock.timers.tick(10 * MINUTE);
    mock.timers.tick(10 * MINUTE);
    mock.timers.tick(10 * MINUTE);

    assert.equal(asker.asked.length, 3);
  });

  it("lets a tick pass while the last task still walks, and puts the next one after it", () => {
    clock.follow({
      directory: DIRECTORY,
      config: configWith(aSchedule()),
      switchedOn: new Set(["schedule-1"]),
    });
    asker.out.add("schedule-1");

    mock.timers.tick(10 * MINUTE);

    assert.equal(asker.asked.length, 0);

    asker.out.delete("schedule-1");
    mock.timers.tick(10 * MINUTE);

    assert.equal(asker.asked.length, 1);
  });

  it("puts nothing for a schedule this machine has not switched on", () => {
    clock.follow({
      directory: DIRECTORY,
      config: configWith(aSchedule()),
      switchedOn: new Set(),
    });

    mock.timers.tick(60 * MINUTE);

    assert.deepEqual(asker.asked, []);
  });

  it("stops putting a schedule switched off", () => {
    clock.follow({
      directory: DIRECTORY,
      config: configWith(aSchedule()),
      switchedOn: new Set(["schedule-1"]),
    });
    clock.follow({
      directory: DIRECTORY,
      config: configWith(aSchedule()),
      switchedOn: new Set(),
    });

    mock.timers.tick(60 * MINUTE);

    assert.deepEqual(asker.asked, []);
  });

  it("puts the task as the project stands at the tick, not as it stood when the timer began", () => {
    clock.follow({
      directory: DIRECTORY,
      config: configWith(aSchedule()),
      switchedOn: new Set(["schedule-1"]),
    });
    clock.follow({
      directory: DIRECTORY,
      config: configWith(
        aSchedule({
          task: "Перевір реліз.",
        }),
      ),
      switchedOn: new Set(["schedule-1"]),
    });

    mock.timers.tick(10 * MINUTE);

    assert.equal(asker.asked[0].task, "Перевір реліз.");
  });

  it("counts a changed interval afresh from the moment it changed", () => {
    clock.follow({
      directory: DIRECTORY,
      config: configWith(aSchedule()),
      switchedOn: new Set(["schedule-1"]),
    });

    mock.timers.tick(5 * MINUTE);
    clock.follow({
      directory: DIRECTORY,
      config: configWith(
        aSchedule({
          everyMinutes: 20,
        }),
      ),
      switchedOn: new Set(["schedule-1"]),
    });
    mock.timers.tick(19 * MINUTE);

    assert.equal(asker.asked.length, 0);

    mock.timers.tick(MINUTE);

    assert.equal(asker.asked.length, 1);
  });

  it("lets go of every timer when another folder is followed", () => {
    clock.follow({
      directory: DIRECTORY,
      config: configWith(aSchedule()),
      switchedOn: new Set(["schedule-1"]),
    });
    clock.follow({
      directory: "/work/other",
      config: configWith(),
      switchedOn: new Set(["schedule-1"]),
    });

    mock.timers.tick(60 * MINUTE);

    assert.deepEqual(asker.asked, []);
  });

  it("says how each schedule stands: switched on, when it puts its task next, and whether one is out", () => {
    clock.follow({
      directory: DIRECTORY,
      config: configWith(
        aSchedule(),
        aSchedule({
          id: "schedule-2",
        }),
      ),
      switchedOn: new Set(["schedule-1"]),
    });
    asker.out.add("schedule-2");

    assert.deepEqual(clock.standings(), [
      {
        scheduleId: "schedule-1",
        isOn: true,
        nextAt: 10 * MINUTE,
        isOut: false,
      },
      {
        scheduleId: "schedule-2",
        isOn: false,
        nextAt: null,
        isOut: true,
      },
    ]);
  });

  it("stands nothing before any project is followed", () => {
    assert.deepEqual(clock.standings(), []);
  });
});
