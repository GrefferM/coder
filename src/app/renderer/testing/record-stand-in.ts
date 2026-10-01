import {
  ADD_RUN_STEP_CHANNEL,
  ASK_AGAIN_CHANNEL,
  CLOSE_RUN_CHANNEL,
  OPEN_RUN_CHANNEL,
  READ_RUN_CHANNEL,
} from "../../../contracts";
import type { AskAgain, OpenRun } from "../../../contracts";
import type { WholeRun, WholeStep, WrittenStep } from "../interfaces";

/** A record that answers the bridge the way the real one does, read back from what it was told. */
export interface RecordStandIn {
  /** Every record channel's payloads, in send order. */
  sent: Record<string, unknown[]>;
  /** The record's answer on its own channels; `undefined` on any other. */
  answer: (channel: string, payload?: unknown) => unknown;
}

/** One row's record held in memory: the row opens, questions and steps land, and a read gives them back whole. */
export function recordStandIn(): RecordStandIn {
  const sent: Record<string, unknown[]> = {};
  const record = [OPEN_RUN_CHANNEL, ASK_AGAIN_CHANNEL, ADD_RUN_STEP_CHANNEL, CLOSE_RUN_CHANNEL, READ_RUN_CHANNEL];

  return {
    sent,
    answer: (channel, payload) => {
      if (!record.includes(channel)) {
        return undefined;
      }

      sent[channel] = [...(sent[channel] ?? []), payload];

      if (channel === OPEN_RUN_CHANNEL) {
        return {
          runId: "run-1",
          questionId: "question-1",
        };
      }

      if (channel === ADD_RUN_STEP_CHANNEL) {
        return `step-${sent[channel].length}`;
      }

      if (channel === ASK_AGAIN_CHANNEL) {
        return (<{ questionId: string }>payload).questionId;
      }

      if (channel === READ_RUN_CHANNEL) {
        return recordedRun(sent);
      }

      return undefined;
    },
  };
}

/** The run as the record would return it, built from the questions and steps it was told. */
export function recordedRun(sent: Record<string, unknown[]>): WholeRun {
  const written = <WrittenStep[]>(sent[ADD_RUN_STEP_CHANNEL] ?? []);
  const walk: WholeStep[] = written.map((step, index) => ({
    ...step,
    id: `step-${index + 1}`,
    place: index + 1,
    startedAt: new Date(step.startedAt),
    endedAt: new Date(step.endedAt),
    calls: [],
  }));

  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: walk[0]?.agentName ?? "",
    startedByAgentColor: walk[0]?.agentColor ?? "",
    askedAgentId: "agent-1",
    askedAgentName: walk[0]?.agentName ?? "",
    asked: "Прогони тести",
    state: "done",
    startedAt: new Date(),
    askedAt: new Date(),
    endedAt: new Date(),
    // Questions as asked, each with the id it came with and the agent it was put to.
    questions: [
      ...(<OpenRun[]>(sent[OPEN_RUN_CHANNEL] ?? [])).map((one) => ({
        id: one.questionId,
        asked: one.asked,
        askedAt: new Date(one.startedAt),
        askedAgentId: one.startedByAgentId,
        attached: one.attached,
      })),
      ...(<AskAgain[]>(sent[ASK_AGAIN_CHANNEL] ?? [])).map((one) => ({
        id: one.questionId,
        asked: one.asked,
        askedAt: new Date(one.askedAt),
        askedAgentId: one.askedAgentId,
        attached: one.attached,
      })),
    ].map((question, index) => ({
      ...question,
      place: index + 1,
    })),
    steps: walk.length,
    money: 0,
    worked: 0,
    walk,
  };
}
