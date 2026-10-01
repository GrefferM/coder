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
  SHARED_MEMORY_CHANNEL,
} from "../../../../../contracts";
import type { AskedQuestion, CallPlace, OpenedRecord, RunHit, RunRow, WholeRun, WrittenStep } from "../interfaces";

/** Opens a run's record with its first question; rejects with the record's own words when refused. */
export async function openRun(directory: string, question: AskedQuestion): Promise<OpenedRecord> {
  return window.electronApi.invoke(OPEN_RUN_CHANNEL, {
    directory,
    questionId: question.questionId,
    startedByAgentId: question.agent.id,
    // The agent's name and colour at the time, so the row is named before its first step.
    startedByAgentName: question.agent.name,
    startedByAgentColor: question.agent.color,
    asked: question.asked,
    attached: question.attached,
    startedAt: question.askedAt,
  });
}

/** Asks again into an existing record under the question's id; false when the row is gone, rejects when refused. */
export async function askAgain(runId: string, question: AskedQuestion): Promise<boolean> {
  const id = await window.electronApi.invoke(ASK_AGAIN_CHANNEL, {
    runId,
    questionId: question.questionId,
    asked: question.asked,
    // Whom the question goes to, so the row's head is named before the first step.
    askedAgentId: question.agent.id,
    askedAgentName: question.agent.name,
    attached: question.attached,
    askedAt: question.askedAt,
  });

  return id !== null;
}

/** Appends one finished step whole; returns the id the next step points at, rejects when refused. */
export async function writeStep(step: WrittenStep): Promise<string> {
  return window.electronApi.invoke(ADD_RUN_STEP_CHANNEL, step);
}

/** Ends a run by stamping when its walk returned; the outcome is counted from the steps. Rejects when refused. */
export async function closeRun(runId: string, endedAt: number): Promise<void> {
  await window.electronApi.invoke(CLOSE_RUN_CHANNEL, {
    runId,
    endedAt,
  });
}

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

/**
 * What has happened to one question so far, as an agent with the shared memory is given it; empty while nothing of it
 * has answered, null for a question the record does not hold, rejects when unreadable.
 */
export async function sharedMemory(runId: string, questionId: string): Promise<string | null> {
  return window.electronApi.invoke(SHARED_MEMORY_CHANNEL, {
    runId,
    questionId,
  });
}

/** Runs containing this word, each with the found words; rejects when the record is unreadable. */
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
