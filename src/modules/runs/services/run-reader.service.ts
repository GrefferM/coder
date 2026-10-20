import {
  CHAT_STOP_REASONS,
  RUN_CALL_SAID_NO,
  RUN_DONE,
  RUN_FAILED,
  RUN_NOT_SENT,
  RUN_RUNNING,
  RUN_STEP_DONE,
  RUN_STEP_NOT_SENT_ENDS,
  RUN_STEP_STOPPED,
  RUN_STOPPED,
  addedMoney,
  askedWithAttached,
  SHARED_MEMORY_ANSWER,
  SHARED_MEMORY_COMPOSED,
  SHARED_MEMORY_FROM_SLOT,
  SHARED_MEMORY_NAMES_SEPARATOR,
  SHARED_MEMORY_NAME_SLOT,
  SHARED_MEMORY_PERSON,
  SHARED_MEMORY_QUESTION,
  latestMemory,
  sharedMemoryBlock,
  sharedMemoryText,
} from "../../../contracts";
import type {
  RunCallEntity,
  RunEntity,
  RunMemoryEntity,
  RunQuestionAttachmentEntity,
  RunQuestionEntity,
  RunStepEntity,
} from "../entities";
import type { AttachmentKind, PackedAttachment, SharedMemory, UnwrittenMemory, WholeMemory } from "../../../contracts";
import type { CallPlace, ChatStopReason, Run, RunStore, RunWhole, WholeCall, WholeStep } from "../interfaces";

/** The record read back: the run list and one run whole. */
export class RunReader {
  constructor(private readonly store: RunStore) {}

  /** The project's runs, newest first, each with its step count. */
  async list(directory: string): Promise<Run[]> {
    const rows = await this.store.runsIn(directory);
    const runs: Run[] = [];

    for (const row of rows) {
      runs.push(this.toRun(row, await this.store.stepsOf(row.id), await this.store.askedIn(row.id)));
    }

    // Newest first by the flow's last word: the last reply, or the question still out.
    return runs.sort((one, other) => this.lastWord(other).getTime() - this.lastWord(one).getTime());
  }

  /** One run whole: steps in running order, calls within each. */
  async one(id: string): Promise<RunWhole | null> {
    const row = await this.store.runById(id);

    if (row === null) {
      return null;
    }

    const stood = await this.store.walkOf(id);
    const walk: WholeStep[] = [];

    for (const step of stood.sort((one, other) => one.place - other.place)) {
      walk.push(await this.toStep(step));
    }

    const asked = await this.store.askedIn(id);
    const attached = await this.store.attachedTo(asked.map((question) => question.id));

    return {
      ...this.toRun(row, stood, asked),
      // The flow's questions, so a reader can group the walk by them rather than by clock.
      questions: asked.map((question) => ({
        id: question.id,
        place: question.place,
        asked: question.asked,
        askedAt: question.askedAt,
        // A question without an addressee falls back to the agent the run started from.
        askedAgentId: question.askedAgentId ?? row.startedByAgentId,
        attached: this.attachedOf(attached, question.id),
      })),
      walk,
      memories: await this.memoriesOf(id),
    };
  }

  /**
   * What has happened to one question so far, as an agent with the shared memory reads it: the question with its files,
   * then every answered turn in the order it landed and whom its work came from; fallen, cut or stopped turns and calls
   * are left out. Where the agent's memory of this question was compressed, the composer's message stands for the
   * question and every answer up to the place it covers, and the answers after it follow as they were; so does one
   * the caller's turn has made and the record is yet to be told of (`unwritten`). Empty while
   * nothing has answered; null for a run or a question the record does not hold.
   */
  async sharedMemory(
    runId: string,
    questionId: string,
    agentId: string,
    unwritten: UnwrittenMemory | null = null,
  ): Promise<SharedMemory | null> {
    const row = await this.store.runById(runId);

    if (row === null) {
      return null;
    }

    const question = (await this.store.askedIn(runId)).find((one) => one.id === questionId) ?? null;

    if (question === null) {
      return null;
    }

    const walk = (await this.store.walkOf(runId)).sort((one, other) => one.place - other.place);
    const written = latestMemory(await this.memoriesOf(runId), agentId, questionId);
    // A compression the record does not hold yet stands in its place where it reaches as far as the one it holds.
    const composed = unwritten !== null && unwritten.coversPlace >= (written?.coversPlace ?? 0) ? unwritten : written;
    // What the composer's message stands for is not told again.
    const answered = walk.filter(
      (step) =>
        step.question.id === questionId && step.state === RUN_STEP_DONE && step.place > (composed?.coversPlace ?? 0),
    );

    if (answered.length === 0 && composed === null) {
      return {
        text: "",
        coversPlace: 0,
      };
    }

    // Names as they stood when each turn ran; a supplier may be any step of the run.
    const names = new Map((await this.store.whoIn(walk.map((step) => step.id))).map((who) => [who.step.id, who.name]));
    const feeds = await this.store.feedsIn(answered.map((step) => step.id));
    const attached = this.attachedOf(await this.store.attachedTo([questionId]), questionId);
    const asked =
      composed === null
        ? sharedMemoryBlock(
            SHARED_MEMORY_QUESTION.replace(SHARED_MEMORY_NAME_SLOT, question.askedAgentName ?? row.startedByAgentName),
            askedWithAttached(question.asked, attached),
          )
        : sharedMemoryBlock(SHARED_MEMORY_COMPOSED, composed.text);
    const answers = answered.map((step) => {
      const from = feeds
        .filter((feed) => feed.step.id === step.id)
        .sort((one, other) => one.place - other.place)
        .map((feed) => names.get(feed.from.id) ?? "");

      return sharedMemoryBlock(
        SHARED_MEMORY_ANSWER.replace(SHARED_MEMORY_NAME_SLOT, names.get(step.id) ?? "").replace(
          SHARED_MEMORY_FROM_SLOT,
          from.length === 0 ? SHARED_MEMORY_PERSON : from.join(SHARED_MEMORY_NAMES_SEPARATOR),
        ),
        step.said,
      );
    });

    return {
      text: sharedMemoryText([asked, ...answers]),
      // The last place the words stand for or tell: what a compression of them would cover.
      coversPlace: Math.max(composed?.coversPlace ?? 0, ...answered.map((step) => step.place)),
    };
  }

  /** Every compression of a memory in one run, with the step that paid for each. */
  private async memoriesOf(runId: string): Promise<WholeMemory[]> {
    return (await this.store.memoriesOf(runId))
      .map((row) => this.toMemory(row))
      .sort((one, other) => one.stepPlace - other.stepPlace);
  }

  private toMemory(row: RunMemoryEntity): WholeMemory {
    return {
      id: row.id,
      stepId: row.step.id,
      stepPlace: row.step.place,
      agentId: row.agentId,
      questionId: row.question?.id ?? null,
      coversPlace: row.coversPlace,
      text: row.text,
      lengthBefore: row.lengthBefore,
      lengthAfter: row.lengthAfter,
      compressAt: row.compressAt,
      compressTo: row.compressTo,
      inputTokens: row.inputTokens,
      outputTokens: row.outputTokens,
      money: row.money,
    };
  }

  /** Where one call stands, by its id; null for a call the record does not hold (e.g. its run was forgotten). */
  async placeOfCall(callId: string): Promise<CallPlace | null> {
    const call = await this.store.callById(callId);

    if (call === null) {
      return null;
    }

    return {
      runId: call.step.run.id,
      questionId: call.step.question.id,
      stepId: call.step.id,
    };
  }

  /** One step with everything beside it: who ran it, on what, with what words, what it did. */
  private async toStep(row: RunStepEntity): Promise<WholeStep> {
    const made = await this.store.callsOf(row.id);
    const fed = await this.store.feedsOf(row.id);
    const links = await this.store.handoffsOf(row.id);
    const who = await this.store.whoOf(row.id);
    const ran = await this.store.ranOf(row.id);
    const given = await this.store.givenOf(row.id);

    return {
      id: row.id,
      questionId: row.question.id,
      walkId: row.walkId,
      place: row.place,
      agentId: who?.agentId ?? "",
      agentName: who?.name ?? "",
      agentColor: who?.color ?? "",
      modelId: ran?.modelId ?? "",
      model: ran?.title ?? "",
      providerId: ran?.providerId ?? "",
      inputPrice: ran?.inputPrice ?? null,
      outputPrice: ran?.outputPrice ?? null,
      contextCeiling: ran?.contextCeiling ?? null,
      answerCeiling: ran?.answerCeiling ?? null,
      promptId: given?.promptId ?? null,
      prompt: given?.prompt ?? "",
      temperature: given?.temperature ?? null,
      maxCalls: given?.maxCalls ?? null,
      memoryLength: given?.memoryLength ?? 0,
      asked: row.asked,
      said: row.said,
      state: row.state,
      inputTokens: row.inputTokens,
      outputTokens: row.outputTokens,
      money: row.money,
      fromStepIds: fed.sort((one, other) => one.place - other.place).map((feed) => feed.from.id),
      handoffs: links
        .sort((one, other) => one.place - other.place)
        .map((link) => ({
          toAgentId: link.toAgentId,
          stopReason: stopReasonOf(link.stopReason),
        })),
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      calls: made.sort((one, other) => one.place - other.place).map((call) => this.toCall(call)),
    };
  }

  /** One question's attachments as they went with it, in the order they were glued in. */
  private attachedOf(rows: RunQuestionAttachmentEntity[], questionId: string): PackedAttachment[] {
    return rows
      .filter((row) => row.question.id === questionId)
      .sort((one, other) => one.place - other.place)
      .map((row) => ({
        path: row.path,
        name: row.name,
        kind: <AttachmentKind>row.kind,
        text: row.text,
        binaries: <string[]>JSON.parse(row.binaries),
      }));
  }

  private toCall(row: RunCallEntity): WholeCall {
    return {
      id: row.id,
      source: row.source,
      place: row.place,
      name: row.name,
      arguments: <Record<string, string>>JSON.parse(row.arguments),
      pinned: <string[]>JSON.parse(row.pinned),
      line: row.line,
      output: row.output,
      refusal: row.refusal,
      exitCode: row.exitCode,
      serverId: row.serverId,
      serverName: row.serverName ?? "",
      // A server's «ні» is stored as the call's end.
      isFailed: row.end === RUN_CALL_SAID_NO,
      end: row.end,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
    };
  }

  /** One history row: the run and what its steps add up to. */
  private toRun(row: RunEntity, steps: RunStepEntity[], asked: RunQuestionEntity[]): Run {
    // The row is named and dated by the flow's last question.
    const last = asked.at(-1) ?? null;

    return {
      id: row.id,
      startedByAgentId: row.startedByAgentId,
      asked: last?.asked ?? "",
      state: this.stateOf(row, steps),
      startedAt: row.startedAt,
      askedAt: last?.askedAt ?? row.startedAt,
      endedAt: row.endedAt,
      steps: steps.length,
      money: addedMoney(steps.map((step) => step.money)),
      // The row's time is the work done, not the wait it stood in.
      worked: steps.reduce((sum, step) => sum + (step.endedAt.getTime() - step.startedAt.getTime()), 0),
      startedByAgentName: row.startedByAgentName,
      startedByAgentColor: row.startedByAgentColor,
      // Names whom the flow was last asked; a question without an addressee falls back to the agent the run started
      // from.
      askedAgentId: last?.askedAgentId ?? row.startedByAgentId,
      askedAgentName: last?.askedAgentName ?? row.startedByAgentName,
    };
  }

  /** The flow's last word: the last reply, or the question still out. */
  private lastWord(run: Run): Date {
    return run.endedAt ?? run.askedAt;
  }

  /** The flow's state: that of its last walk, counted on every read. */
  private stateOf(row: RunEntity, steps: RunStepEntity[]): string {
    if (row.endedAt === null) {
      return RUN_RUNNING;
    }

    const last = steps.reduce<RunStepEntity | null>(
      (standing, step) => (standing === null || step.place > standing.place ? step : standing),
      null,
    );

    // A flow closed with no step sent nothing, so nothing fell.
    if (last === null) {
      return RUN_NOT_SENT;
    }

    // The last walk may branch, and turns finish in any order, so every turn of it is read, not just the latest.
    const walk = steps.filter((step) => step.walkId === last.walkId);
    const unanswered = walk.filter((step) => step.state !== RUN_STEP_DONE);

    if (unanswered.length === 0) {
      return RUN_DONE;
    }

    // A stop is a person's act, so a stopped walk is stopped, not fallen; when another branch ended otherwise, that
    // outcome wins.
    if (unanswered.every((step) => step.state === RUN_STEP_STOPPED)) {
      return RUN_STOPPED;
    }

    // Differing branches take the worse word: «УПАВ» over «НЕ ПІШОВ». An unknown end word counts as a fall.
    const fell = unanswered.filter(
      (step) => step.state !== RUN_STEP_STOPPED && !RUN_STEP_NOT_SENT_ENDS.includes(step.state),
    );

    return fell.length === 0 ? RUN_NOT_SENT : RUN_FAILED;
  }
}

/** The reason is stored as text and only two values are known; anything else counts as a link that went through. */
function stopReasonOf(said: string | null): ChatStopReason | null {
  return said !== null && CHAT_STOP_REASONS.includes(<ChatStopReason>said) ? <ChatStopReason>said : null;
}
