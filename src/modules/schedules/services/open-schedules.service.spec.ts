import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { aConfig, anAgent, openTestDatabase } from "../../../utils/testing";
import { ScheduleSwitchEntity } from "../entities";
import { OpenSchedules } from "./open-schedules.service";
import { ScheduleClock } from "./schedule-clock.service";
import { ScheduleSwitches } from "./schedule-switches.service";
import type { ScheduledTask } from "../../../contracts";
import type { ScheduledAsker } from "../interfaces";
import type { TestDatabase } from "../../../utils/testing";

const SCHEDULE_ID = "77777777-7777-4777-8777-777777777777";
const CONFIG = aConfig({
  agents: [
    anAgent({
      id: "agent-1",
    }),
  ],
  schedules: [
    {
      id: SCHEDULE_ID,
      agentId: "agent-1",
      task: "Перевір main.",
      everyMinutes: 10,
    },
  ],
});

/** An asker nobody reaches in these specs: no timer runs out. */
class IdleAsker implements ScheduledAsker {
  ask(_task: ScheduledTask): void {
    throw new Error("no task was to be put");
  }

  isOut(): boolean {
    return false;
  }
}

describe("OpenSchedules", () => {
  let database: TestDatabase;
  let clock: ScheduleClock;
  let schedules: OpenSchedules;

  beforeEach(async () => {
    database = await openTestDatabase();

    const repository = database.dataSource.getRepository(ScheduleSwitchEntity);
    const switches = new ScheduleSwitches(repository);
    const asker = new IdleAsker();

    clock = new ScheduleClock(asker);
    schedules = new OpenSchedules(clock, switches);
  });

  afterEach(async () => {
    clock.stop();
    await database.close();
  });

  it("holds a schedule off until this machine switches it on", async () => {
    await schedules.follow({
      directory: "/work/coder",
      config: CONFIG,
    });

    assert.equal(schedules.standings()[0].isOn, false);
    assert.equal(schedules.standings()[0].nextAt, null);
  });

  it("starts the clock for a schedule the moment it is switched on", async () => {
    await schedules.follow({
      directory: "/work/coder",
      config: CONFIG,
    });
    await schedules.switch({
      scheduleId: SCHEDULE_ID,
      isOn: true,
    });

    assert.equal(schedules.standings()[0].isOn, true);
    assert.notEqual(schedules.standings()[0].nextAt, null);
  });

  it("keeps the switch in this machine's database, so it stands the next time the app opens", async () => {
    await schedules.switch({
      scheduleId: SCHEDULE_ID,
      isOn: true,
    });

    const reopened = await database.reopen();
    const repository = reopened.getRepository(ScheduleSwitchEntity);
    const switches = new ScheduleSwitches(repository);
    const switchedOn = await switches.switchedOn();

    await database.close(reopened);

    assert.deepEqual([...switchedOn], [SCHEDULE_ID]);
  });

  it("forgets the switch when the schedule is switched off", async () => {
    await schedules.follow({
      directory: "/work/coder",
      config: CONFIG,
    });
    await schedules.switch({
      scheduleId: SCHEDULE_ID,
      isOn: true,
    });
    await schedules.switch({
      scheduleId: SCHEDULE_ID,
      isOn: false,
    });

    assert.equal(schedules.standings()[0].isOn, false);
    assert.equal(schedules.standings()[0].nextAt, null);
  });
});
