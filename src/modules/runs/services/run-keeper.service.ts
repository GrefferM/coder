import { HISTORY_DAYS, HISTORY_DAY_MS } from "../constants";
import type { RunEntity } from "../entities";
import type { RunStore } from "../interfaces";
import type { ForgetRunDto } from "../dto";

/** The record's housekeeping: what is deleted by hand, and what goes by itself. */
export class RunKeeper {
  constructor(private readonly store: RunStore) {}

  /**
   * One run deleted by hand, with its steps and their calls; there is no undoing it. A run still going is
   * not deleted, and the answer says so.
   */
  async forget(payload: ForgetRunDto): Promise<boolean> {
    const row = await this.store.runById(payload.id);

    if (row !== null && row.endedAt === null) {
      return false;
    }

    await this.drop(payload.id);

    return true;
  }

  /** Every run of this project that has ended; one still going is left where it is. */
  async forgetEnded(directory: string): Promise<number> {
    const ended = (await this.store.runsIn(directory)).filter((row) => row.endedAt !== null);

    for (const row of ended) {
      await this.drop(row.id);
    }

    return ended.length;
  }

  /** Every run of one project — by hand from the end of the history, or when the project is forgotten. */
  async forgetProject(directory: string): Promise<number> {
    const rows = await this.store.runsIn(directory);

    for (const row of rows) {
      await this.drop(row.id);
    }

    return rows.length;
  }

  /**
   * A walk cannot outlive the window it ran in: on waking, every run left open is closed at the last
   * thing that happened in it — its last step's end, or the question where it reached no step.
   */
  async settleOpen(): Promise<number> {
    const rows = await this.store.runsStillOpen();

    for (const row of rows) {
      const stood = await this.store.stepsOf(row.id);
      const last = stood.reduce<Date | null>(
        (latest, step) => (latest === null || step.endedAt > latest ? step.endedAt : latest),
        null,
      );

      await this.store.endRun(row.id, last ?? (await this.lastAsked(row.id)) ?? row.startedAt);
    }

    return rows.length;
  }

  /** Drops runs older than thirty days; they are read first, a machine holding only thirty days of them. */
  async sweep(now = new Date()): Promise<number> {
    const edge = now.getTime() - HISTORY_DAYS * HISTORY_DAY_MS;
    const rows = await this.store.allRuns();
    const old: RunEntity[] = [];

    // The thirty days are counted from the flow's last word, not from the day it began.
    for (const row of rows) {
      const word = row.endedAt ?? (await this.lastAsked(row.id)) ?? row.startedAt;

      if (word.getTime() < edge) {
        old.push(row);
      }
    }

    for (const row of old) {
      await this.drop(row.id);
    }

    return old.length;
  }

  /** Deletes a run and everything under it, deepest first. */
  private async drop(id: string): Promise<void> {
    for (const step of await this.store.stepsOf(id)) {
      await this.store.dropBesideStep(step.id);
    }

    await this.store.dropStepsOf(id);
    await this.store.dropQuestionsOf(id);
    await this.store.dropRun(id);
  }

  /** When the flow was last asked; null for a row whose questions are somehow gone. */
  private async lastAsked(runId: string): Promise<Date | null> {
    return (await this.store.askedIn(runId)).at(-1)?.askedAt ?? null;
  }
}
