import {
  CALL_PLACE_CHANNEL,
  LIST_RUNS_CHANNEL,
  FORGET_RUN_CHANNEL,
  FORGET_RUNS_CHANNEL,
  READ_RUN_CHANNEL,
  SEARCH_RUNS_CHANNEL,
} from "../../../../../contracts";
import type { CallPlace, RunHit, RunRow, WholeRun } from "../interfaces";

/** The project's runs on this machine, newest first; rejects when the record is unreadable. */
export async function listRuns(directory: string): Promise<RunRow[]> {
  return window.electronApi.invoke(LIST_RUNS_CHANNEL, {
    directory,
  });
}

/** One run whole, steps in run order; null for a run the record does not hold, rejects when unreadable. */
export async function readRun(id: string): Promise<WholeRun | null> {
  return window.electronApi.invoke(READ_RUN_CHANNEL, {
    id,
  });
}

/** Every place this word stands in, newest first, cut at `RUN_HITS_LIMIT`; rejects when the record is unreadable. */
export async function searchRuns(directory: string, query: string): Promise<RunHit[]> {
  return window.electronApi.invoke(SEARCH_RUNS_CHANNEL, {
    directory,
    query,
  });
}

/** Where a call stands in the record, by id; null when the record lacks it, rejects when unreadable. */
export async function callPlace(callId: string): Promise<CallPlace | null> {
  return window.electronApi.invoke(CALL_PLACE_CHANNEL, {
    callId,
  });
}

/** Removes one run with its steps and calls; says whether it went, rejects when refused. */
export async function forgetRun(id: string): Promise<boolean> {
  return window.electronApi.invoke(FORGET_RUN_CHANNEL, {
    id,
  });
}

/** Removes every ended run of this project; returns how many went, rejects when refused. */
export async function forgetRuns(directory: string): Promise<number> {
  return window.electronApi.invoke(FORGET_RUNS_CHANNEL, {
    directory,
  });
}
