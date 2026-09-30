import type { RunOpened, RunStore } from "../interfaces";
import type { AddCallDto, AddStepDto, AskAgainDto, CloseRunDto, OpenRunDto } from "../dto";

/** The record as it is written — a run opened, its steps landing one by one, and its end. */
export class RunWriter {
  constructor(private readonly store: RunStore) {}

  /**
   * Opens a run with the first thing the person asked and hands back both ids; it stands open until something closes
   * it. A step names the question it grew from.
   */
  async open(payload: OpenRunDto): Promise<RunOpened> {
    const row = await this.store.openRun({
      directory: payload.directory,
      startedByAgentId: payload.startedByAgentId,
      startedByAgentName: payload.startedByAgentName,
      startedByAgentColor: payload.startedByAgentColor,
      startedAt: new Date(payload.startedAt),
    });
    const question = await this.store.askIn({
      id: payload.questionId,
      place: 1,
      asked: payload.asked,
      askedAt: new Date(payload.startedAt),
      // The first question is put to the agent the run starts from — the same fact, said in its place.
      askedAgentId: payload.startedByAgentId,
      askedAgentName: payload.startedByAgentName,
      runId: row.id,
    });

    return {
      runId: row.id,
      questionId: question.id,
    };
  }

  /**
   * A flow asked again goes on in the record it already has — the row's text and hour are the new
   * question's, the day it began stays where it was, and the run stands open again.
   */
  async askAgain(payload: AskAgainDto): Promise<string | null> {
    const row = await this.store.runById(payload.runId);

    // A record deleted by hand while its flow stood open: there is nothing to go on in, and it says so.
    if (row === null) {
      return null;
    }

    const stood = await this.store.askedIn(payload.runId);
    const question = await this.store.askIn({
      id: payload.questionId,
      place: stood.length + 1,
      asked: payload.asked,
      askedAt: new Date(payload.askedAt),
      askedAgentId: payload.askedAgentId,
      askedAgentName: payload.askedAgentName,
      runId: payload.runId,
    });

    await this.store.endRun(payload.runId, null);

    return question.id;
  }

  /** Appends one finished step with everything it did; its place is where it fell in the order. */
  async step(payload: AddStepDto): Promise<string> {
    const stood = await this.store.stepsOf(payload.runId);
    const step = await this.store.addStep({
      place: stood.length + 1,
      walkId: payload.walkId,
      questionId: payload.questionId,
      asked: payload.asked,
      said: payload.said,
      state: payload.state,
      inputTokens: payload.inputTokens,
      outputTokens: payload.outputTokens,
      money: payload.money,
      startedAt: new Date(payload.startedAt),
      endedAt: new Date(payload.endedAt),
      runId: payload.runId,
    });

    // Who ran it, on what model, and with what words — each beside the step, frozen.
    await this.store.addWho({
      agentId: payload.agentId,
      name: payload.agentName,
      color: payload.agentColor,
      stepId: step.id,
    });
    await this.store.addRan({
      modelId: payload.modelId,
      title: payload.model,
      providerId: payload.providerId,
      inputPrice: payload.inputPrice,
      outputPrice: payload.outputPrice,
      contextCeiling: payload.contextCeiling,
      answerCeiling: payload.answerCeiling,
      stepId: step.id,
    });
    await this.store.addGiven({
      promptId: payload.promptId,
      prompt: payload.prompt,
      temperature: payload.temperature,
      maxCalls: payload.maxCalls,
      stepId: step.id,
    });

    for (const [index, call] of payload.calls.entries()) {
      await this.saveCall(step.id, index + 1, call);
    }

    // The two edges of the walk, each a row of its own with a key.
    for (const [index, fromStepId] of payload.fromStepIds.entries()) {
      await this.store.addFeed({
        place: index + 1,
        stepId: step.id,
        fromStepId,
      });
    }

    for (const [index, handoff] of payload.handoffs.entries()) {
      await this.store.addHandoff({
        place: index + 1,
        toAgentId: handoff.toAgentId,
        stopReason: handoff.stopReason,
        stepId: step.id,
      });
    }

    return step.id;
  }

  /** Ends a run; a run already ended is written over, the last word being the true one. */
  async close(payload: CloseRunDto): Promise<void> {
    await this.store.endRun(payload.runId, new Date(payload.endedAt));
  }

  /** One call of a step, its arguments and its pinned names kept as the text the base holds. */
  private async saveCall(stepId: string, place: number, call: AddCallDto): Promise<void> {
    await this.store.addCall({
      id: call.id,
      source: call.source,
      place,
      name: call.name,
      arguments: JSON.stringify(call.arguments),
      pinned: JSON.stringify(call.pinned),
      line: call.line,
      output: call.output,
      refusal: call.refusal,
      exitCode: call.exitCode,
      serverId: call.serverId,
      serverName: call.serverName,
      end: call.end,
      startedAt: new Date(call.startedAt),
      endedAt: new Date(call.endedAt),
      stepId,
    });
  }
}
