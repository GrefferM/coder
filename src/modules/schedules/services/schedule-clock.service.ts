import { runnableSchedules } from "../logic";
import type {
  FollowedProject,
  RunnableSchedule,
  ScheduleStanding,
  ScheduledAsker,
  TickingSchedule,
} from "../interfaces";

/**
 * Puts each runnable schedule's task at its interval, counted from the moment the clock began to hold it. A task still
 * walking when the next one is due lets that one pass; nothing is queued and nothing missed is caught up.
 */
export class ScheduleClock {
  private followed: FollowedProject | null = null;
  private readonly ticking = new Map<string, TickingSchedule>();
  /** When each schedule last put its task. */
  private readonly askedAt = new Map<string, number>();

  constructor(private readonly asker: ScheduledAsker) {}

  /** The project open on screen; another folder lets every timer of the last one go. */
  follow(followed: FollowedProject): void {
    if (this.followed !== null && this.followed.directory !== followed.directory) {
      this.stop();
    }

    this.followed = followed;
    this.settle();
  }

  standings(): ScheduleStanding[] {
    if (this.followed === null) {
      return [];
    }

    const { config, switchedOn } = this.followed;

    return config.schedules.map((schedule) => ({
      scheduleId: schedule.id,
      isOn: switchedOn.has(schedule.id),
      nextAt: this.ticking.get(schedule.id)?.nextAt ?? null,
      outSince: this.asker.isOut(schedule.id) ? (this.askedAt.get(schedule.id) ?? null) : null,
    }));
  }

  stop(): void {
    for (const ticking of this.ticking.values()) {
      clearTimeout(ticking.timer);
    }

    this.ticking.clear();
  }

  /** Starts a timer for each schedule that can run and has none, and lets go of the rest. */
  private settle(): void {
    const runnable = this.runnableNow();

    for (const [scheduleId, ticking] of this.ticking) {
      const standing = runnable.find((one) => one.scheduleId === scheduleId) ?? null;

      if (standing === null || standing.everyMs !== ticking.everyMs) {
        clearTimeout(ticking.timer);
        this.ticking.delete(scheduleId);
      }
    }

    for (const standing of runnable) {
      if (!this.ticking.has(standing.scheduleId)) {
        this.hold(standing);
      }
    }
  }

  private hold(standing: RunnableSchedule): void {
    this.ticking.set(standing.scheduleId, {
      everyMs: standing.everyMs,
      nextAt: Date.now() + standing.everyMs,
      timer: setTimeout(() => this.tick(standing.scheduleId), standing.everyMs),
    });
  }

  /** The task as the project stands at the tick; a schedule that can no longer run says nothing. */
  private tick(scheduleId: string): void {
    const standing = this.runnableNow().find((one) => one.scheduleId === scheduleId) ?? null;

    this.ticking.delete(scheduleId);

    if (standing === null || this.followed === null) {
      return;
    }

    this.hold(standing);

    if (this.asker.isOut(scheduleId)) {
      return;
    }

    this.askedAt.set(scheduleId, Date.now());
    this.asker.ask({
      scheduleId,
      directory: this.followed.directory,
      config: this.followed.config,
      agent: standing.agent,
      task: standing.task,
    });
  }

  private runnableNow(): RunnableSchedule[] {
    if (this.followed === null) {
      return [];
    }

    return runnableSchedules(this.followed.config, this.followed.switchedOn);
  }
}
