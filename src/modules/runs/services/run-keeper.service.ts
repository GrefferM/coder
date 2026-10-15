import { HISTORY_DAYS, HISTORY_DAY_MS } from "../constants";
import type { RunEntity } from "../entities";
import type { RunStore } from "../interfaces";
import type { ForgetRunDto } from "../dto";

/** The record's housekeeping: manual deletion and automatic removal. */
export class RunKeeper {
  constructor(private readonly store: RunStore) {}

  /** Deletes one run with its steps and calls, irreversibly; a running run is kept and the result says so. */
  async forget(payload: ForgetRunDto): Promise<boolean> {
    const row = await this.store.runById(payload.id);

    if (row !== null && row.endedAt === null) {
      return false;
    }

    await this.drop(payload.id);

    return true;
  }

  /** Every ended run of this project; a running one is left. */
  async forgetEnded(directory: string): Promise<number> {
    const ended = (await this.store.runsIn(directory)).filter((row) => row.endedAt !== null);

    for (const row of ended) {
      await this.drop(row.id);
    }

    return ended.length;
  }

  /** Every run of one project, running ones too. */
  async forgetProject(directory: string): Promise<number> {
    const rows = await this.store.runsIn(directory);

    for (const row of rows) {
      await this.drop(row.id);
    }

    return rows.length;
  }

  /**
   * A walk cannot outlive the app: on start, runs left open are closed at their last event (last step's end, or the
   * question if no step).
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

  /** Drops runs older than thirty days. */
  async sweep(now = new Date()): Promise<number> {
    const edge = now.getTime() - HISTORY_DAYS * HISTORY_DAY_MS;
    const rows = await this.store.allRuns();
    const old: RunEntity[] = [];

    // Thirty days count from the flow's last word, not its start.
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
    await this.store.dropAttachedOf(id);
    await this.store.dropQuestionsOf(id);
    await this.store.dropRun(id);
  }

  /** When the flow was last asked; null if its questions are gone. */
  private async lastAsked(runId: string): Promise<Date | null> {
    return (await this.store.askedIn(runId)).at(-1)?.askedAt ?? null;
  }
}
