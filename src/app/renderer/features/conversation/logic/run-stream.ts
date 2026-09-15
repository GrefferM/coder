import { notStartedOf } from "./not-started-of";
import { turnLength } from "./turn-length";
import {
  RUN_STEP_CALLS,
  RUN_STEP_CEILING,
  RUN_STEP_FAILED,
  RUN_STEP_SILENT,
  RUN_STEP_STOPPED,
  RUN_STEP_TOO_LONG,
} from "../../record";
import { answerCeilingNote, callsExhaustedNote } from "../words";
import { CHAT_FAILED_NOTE, CHAT_SAID_NOTHING_NOTE, CHAT_STOPPED_NOTE } from "../constants";
import type { ChatMessage } from "../interfaces";
import type { WholeRun, WholeStep } from "../../record";
import type { TurnCall } from "../../../interfaces";

/** A call as the record kept it, pinned arguments and all. */
function turnCall(step: WholeStep): TurnCall[] {
  return step.calls.map((call) => ({
    id: call.id,
    name: call.name,
    arguments: call.arguments,
    pinned: call.pinned,
    line: call.line,
    output: call.output,
    refusal: call.refusal,
    exitCode: call.exitCode,
    serverId: call.serverId,
    serverName: call.serverName,
    isFailed: call.isFailed,
    startedAt: call.startedAt.getTime(),
    endedAt: call.endedAt.getTime(),
  }));
}

/** An empty turn of a message the stream draws the same way it draws a live one. */
function message(
  patch: Partial<ChatMessage> & Pick<ChatMessage, "id" | "agentId" | "from" | "at" | "questionId" | "askedAt">,
): ChatMessage {
  return {
    text: "",
    cost: null,
    answerCeiling: null,
    otherAgentId: null,
    stopReason: null,
    isFailure: false,
    notStarted: null,
    wouldGo: null,
    calls: [],
    began: null,
    stepId: null,
    walkId: null,
    note: null,
    asked: null,
    fedBy: [],
    ...patch,
  };
}

/**
 * The app's word about a recorded step — the same word the live stream said. The calls ceiling names
 * its own number, and the calls stand in the record beside the step.
 */
function noteOf(step: WholeStep): string | null {
  if (step.state === RUN_STEP_FAILED) {
    return CHAT_FAILED_NOTE;
  }

  if (step.state === RUN_STEP_STOPPED) {
    return CHAT_STOPPED_NOTE;
  }

  if (step.state === RUN_STEP_CEILING) {
    return answerCeilingNote(step.answerCeiling);
  }

  if (step.state === RUN_STEP_SILENT) {
    return CHAT_SAID_NOTHING_NOTE;
  }

  return step.state === RUN_STEP_CALLS ? callsExhaustedNote(step.calls.length) : null;
}

/** Whether a link's work came to a turn of its own, which the stream draws where the work arrived. */
function ledOn(walk: WholeStep[], step: WholeStep, toAgentId: string): boolean {
  return walk.some((other) => other.agentId === toAgentId && other.fromStepIds.includes(step.id));
}

/**
 * A run read back from the record in the shape of a live turn — a block per question, holding the
 * steps that name it in the order they ran. A question that reached nobody keeps its block.
 */
export function runStream(run: WholeRun): ChatMessage[] {
  const walk = [...run.walk].sort((one, other) => one.place - other.place);
  const said: ChatMessage[] = [];

  for (const question of [...run.questions].sort((one, other) => one.place - other.place)) {
    const askedAt = question.askedAt.getTime();
    const grew = walk.filter((step) => step.questionId === question.id);
    // The record does not keep whom a question was aimed at: it is the first turn nobody fed.
    const aimed = grew.find((step) => step.fromStepIds.length === 0) ?? null;

    said.push(
      message({
        id: `${question.id}:asked`,
        agentId: aimed?.agentId ?? run.startedByAgentId,
        from: "person",
        at: question.askedAt.toISOString(),
        questionId: question.id,
        askedAt,
        text: question.asked,
        // The walk this question started, so the projection is opened by it and not by the hour.
        walkId: aimed?.walkId ?? null,
      }),
    );

    for (const step of grew) {
      // One row per supplier, over the turn their work started — where the work arrived.
      for (const fed of walk.filter((other) => step.fromStepIds.includes(other.id))) {
        said.push(
          message({
            id: `${fed.id}:${step.id}`,
            agentId: fed.agentId,
            from: "handoff",
            at: step.startedAt.toISOString(),
            questionId: question.id,
            askedAt,
            otherAgentId: step.agentId,
            walkId: step.walkId,
          }),
        );
      }

      // A turn that never began is a step, and the card it stood as is read back off its end.
      const notStarted = notStartedOf(step.state);

      said.push(
        message({
          id: step.id,
          agentId: step.agentId,
          from: "agent",
          at: step.endedAt.toISOString(),
          questionId: question.id,
          askedAt,
          // What the provider said, kept as it came; for a turn that ran, the model's own words.
          text: step.said,
          // Its own question and the steps that fed it, for a repeat to pick the walk up on.
          asked: step.asked,
          fedBy: step.fromStepIds,
          isFailure: step.state === RUN_STEP_FAILED,
          note: noteOf(step),
          notStarted,
          // The breakdown is counted again from the words and the ceiling the model had then.
          wouldGo:
            step.state === RUN_STEP_TOO_LONG && step.contextCeiling !== null
              ? turnLength(step.prompt, step.asked, step.contextCeiling)
              : null,
          answerCeiling: step.answerCeiling,
          cost:
            notStarted !== null
              ? null
              : {
                  inputTokens: step.inputTokens,
                  outputTokens: step.outputTokens,
                  money: step.money,
                },
          calls: turnCall(step),
          // Which step of the walk this was, counted off the same edges the record keeps.
          began: step.startedAt.toISOString(),
          stepId: step.id,
          walkId: step.walkId,
        }),
      );

      // A link that led nowhere — the neighbour switched off, or the stop caught the turn before it began.
      // A link whose work came to a turn is drawn over that turn, not twice.
      for (const handoff of step.handoffs.filter((one) => !ledOn(walk, step, one.toAgentId))) {
        said.push(
          message({
            id: `${step.id}:${handoff.toAgentId}`,
            agentId: step.agentId,
            from: "handoff",
            at: step.endedAt.toISOString(),
            questionId: question.id,
            askedAt,
            otherAgentId: handoff.toAgentId,
            stopReason: handoff.stopReason,
            walkId: step.walkId,
          }),
        );
      }
    }
  }

  return said;
}
