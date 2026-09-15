import {
  ADD_RUN_STEP_CHANNEL,
  CALL_PLACE_CHANNEL,
  CLOSE_RUN_CHANNEL,
  ASK_AGAIN_CHANNEL,
  LIST_RUNS_CHANNEL,
  FORGET_RUN_CHANNEL,
  FORGET_RUNS_CHANNEL,
  OPEN_RUN_CHANNEL,
  READ_RUN_CHANNEL,
  SEARCH_RUNS_CHANNEL,
} from "../../../../../contracts";
import type { Agent } from "../../../interfaces";
import type { CallPlace, OpenedRecord, RunHit, RunRow, WholeRun, WrittenStep } from "../interfaces";

/** Opens the record of a run; every write here swallows its failure and the run goes unremembered. */
export async function openRun(
  directory: string,
  startedBy: Agent,
  questionId: string,
  asked: string,
  startedAt: number,
): Promise<OpenedRecord | null> {
  const opened = await window.electronApi
    .invoke(OPEN_RUN_CHANNEL, {
      directory,
      questionId,
      startedByAgentId: startedBy.id,
      // What the agent was called and coloured then, so the row is named before its first step lands.
      startedByAgentName: startedBy.name,
      startedByAgentColor: startedBy.color,
      asked,
      startedAt,
    })
    .catch(() => null);

  return opened ?? null;
}

/**
 * Asks again into a record that already stands, under the question's own id; says whether the row was
 * still there to take it.
 */
export async function askAgain(
  runId: string,
  questionId: string,
  askedTo: Agent,
  asked: string,
  askedAt: number,
): Promise<boolean> {
  const id = await window.electronApi
    .invoke(ASK_AGAIN_CHANNEL, {
      runId,
      questionId,
      asked,
      // Whom this question goes to, said with it — the head of the row is named before the first step.
      askedAgentId: askedTo.id,
      askedAgentName: askedTo.name,
      askedAt,
    })
    .catch(() => null);

  return id !== null && id !== undefined;
}

/** Appends one finished step with everything it did; hands back the id the next step points at. */
export async function writeStep(step: WrittenStep): Promise<string | null> {
  const id = await window.electronApi.invoke(ADD_RUN_STEP_CHANNEL, step).catch(() => null);

  return id ?? null;
}

/** Ends a run by stamping the hour its walk came back; how it ended is counted from the steps. */
export async function closeRun(runId: string, endedAt: number): Promise<void> {
  await window.electronApi
    .invoke(CLOSE_RUN_CHANNEL, {
      runId,
      endedAt,
    })
    .catch(() => undefined);
}

/** The project's runs on this machine, newest first; null when the record could not be read, not empty. */
export async function listRuns(directory: string): Promise<RunRow[] | null> {
  return window.electronApi
    .invoke(LIST_RUNS_CHANNEL, {
      directory,
    })
    .catch(() => null);
}

/** One run opened whole — every step in the order it ran; null when the record cannot be read. */
export async function readRun(id: string): Promise<WholeRun | null> {
  const run = await window.electronApi
    .invoke(READ_RUN_CHANNEL, {
      id,
    })
    .catch(() => null);

  return run ?? null;
}

/**
 * The runs this word stands in, each with the found words themselves; an empty list where nothing was
 * found, and an empty list too where the record could not be read — a search that failed shows the same nothing.
 */
export async function searchRuns(directory: string, query: string): Promise<RunHit[]> {
  return window.electronApi
    .invoke(SEARCH_RUNS_CHANNEL, {
      directory,
      query,
    })
    .catch(() => []);
}

/**
 * Where one call stands in the record, by its own id — nothing where the record does not hold it, and
 * nothing where it cannot be asked at all, because a place nobody found leads nowhere either way.
 */
export async function callPlace(callId: string): Promise<CallPlace | null> {
  return window.electronApi
    .invoke(CALL_PLACE_CHANNEL, {
      callId,
    })
    .catch(() => null);
}

/** Takes one run out of the record with its steps and calls, and says whether it went. */
export async function forgetRun(id: string): Promise<boolean> {
  return window.electronApi
    .invoke(FORGET_RUN_CHANNEL, {
      id,
    })
    .catch(() => false);
}

/** Takes every ended run of this project, answering with how many went; null when the record refused. */
export async function forgetRuns(directory: string): Promise<number | null> {
  return window.electronApi
    .invoke(FORGET_RUNS_CHANNEL, {
      directory,
    })
    .catch(() => null);
}
