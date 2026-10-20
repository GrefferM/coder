import type { PackedAttachment } from "../../../contracts";
import type { AddCall, AddStep, AskAgain, CloseRun, OpenRun, RunOpened, RunStore } from "../interfaces";

/** The record as written: a run opened, steps landing one by one, its end. */
export class RunWriter {
  constructor(private readonly store: RunStore) {}

  /** Opens a run with the person's first question, both or neither, and returns both ids; open until closed. */
  async open(payload: OpenRun): Promise<RunOpened> {
    return this.store.inOne(async (store) => {
      const row = await store.openRun({
        directory: payload.directory,
        startedByAgentId: payload.startedByAgentId,
        startedByAgentName: payload.startedByAgentName,
        startedByAgentColor: payload.startedByAgentColor,
        startedAt: new Date(payload.startedAt),
      });
      const question = await store.askIn({
        id: payload.questionId,
        place: 1,
        asked: payload.asked,
        askedAt: new Date(payload.startedAt),
        // The first question goes to the agent the run starts from.
        askedAgentId: payload.startedByAgentId,
        askedAgentName: payload.startedByAgentName,
        runId: row.id,
      });

      await this.attach(store, question.id, payload.attached);

      return {
        runId: row.id,
        questionId: question.id,
      };
    });
  }

  /**
   * Continues a flow in its existing record: the row's text and hour become the new question's, the start day stays, the
   * run reopens.
   */
  async askAgain(payload: AskAgain): Promise<string | null> {
    return this.store.inOne(async (store) => {
      const row = await store.runById(payload.runId);

      // The record was deleted by hand while its flow was open; nothing to continue.
      if (row === null) {
        return null;
      }

      const stood = await store.askedIn(payload.runId);
      const question = await store.askIn({
        id: payload.questionId,
        place: stood.length + 1,
        asked: payload.asked,
        askedAt: new Date(payload.askedAt),
        askedAgentId: payload.askedAgentId,
        askedAgentName: payload.askedAgentName,
        runId: payload.runId,
      });

      await this.attach(store, question.id, payload.attached);
      await store.endRun(payload.runId, null);

      return question.id;
    });
  }

  /** Appends one finished step whole, with everything beside it; its place is its order of arrival. */
  async step(payload: AddStep): Promise<string> {
    return this.store.inOne(async (store) => {
      const stood = await store.stepsOf(payload.runId);
      const step = await store.addStep({
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

      // Who ran it, on what model and with what words, frozen beside the step.
      await store.addWho({
        agentId: payload.agentId,
        name: payload.agentName,
        color: payload.agentColor,
        stepId: step.id,
      });
      await store.addRan({
        modelId: payload.modelId,
        title: payload.model,
        providerId: payload.providerId,
        inputPrice: payload.inputPrice,
        outputPrice: payload.outputPrice,
        contextCeiling: payload.contextCeiling,
        answerCeiling: payload.answerCeiling,
        stepId: step.id,
      });
      await store.addGiven({
        promptId: payload.promptId,
        prompt: payload.prompt,
        temperature: payload.temperature,
        maxCalls: payload.maxCalls,
        memoryLength: payload.memoryLength,
        stepId: step.id,
      });

      // What the composers wrote for this turn's memory and its tools', in the same write as the turn that paid for them.
      for (const memory of payload.memories) {
        await store.addMemory({
          ...memory,
          runId: payload.runId,
          stepId: step.id,
        });
      }

      for (const [index, call] of payload.calls.entries()) {
        await this.saveCall(store, step.id, index + 1, call);
      }

      // The two edges of the walk, each a row of its own with a key.
      for (const [index, fromStepId] of payload.fromStepIds.entries()) {
        await store.addFeed({
          place: index + 1,
          stepId: step.id,
          fromStepId,
        });
      }

      for (const [index, handoff] of payload.handoffs.entries()) {
        await store.addHandoff({
          place: index + 1,
          toAgentId: handoff.toAgentId,
          stopReason: handoff.stopReason,
          stepId: step.id,
        });
      }

      return step.id;
    });
  }

  /** Ends a run; closing an ended run overwrites, the last word being true. */
  async close(payload: CloseRun): Promise<void> {
    await this.store.endRun(payload.runId, new Date(payload.endedAt));
  }

  /** The files and folders sent with a question, beside it and in the order they were glued in. */
  private async attach(store: RunStore, questionId: string, attached: PackedAttachment[]): Promise<void> {
    for (const [index, one] of attached.entries()) {
      await store.attachTo({
        place: index + 1,
        path: one.path,
        name: one.name,
        kind: one.kind,
        text: one.text,
        binaries: JSON.stringify(one.binaries),
        questionId,
      });
    }
  }

  /** One call of a step; arguments and pinned names stored as text. */
  private async saveCall(store: RunStore, stepId: string, place: number, call: AddCall): Promise<void> {
    await store.addCall({
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
