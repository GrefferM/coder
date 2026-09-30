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
} from "../../../contracts";
import type { RunCallEntity, RunEntity, RunQuestionEntity, RunStepEntity } from "../entities";
import type { CallPlace, ChatStopReason, Run, RunStore, RunWhole, WholeCall, WholeStep } from "../interfaces";

/** The record as it is read back — the list of runs, and one run whole. */
export class RunReader {
  constructor(private readonly store: RunStore) {}

  /** The project's runs, newest first, each with how many steps it took. */
  async list(directory: string): Promise<Run[]> {
    const rows = await this.store.runsIn(directory);
    const runs: Run[] = [];

    for (const row of rows) {
      runs.push(this.toRun(row, await this.store.stepsOf(row.id), await this.store.askedIn(row.id)));
    }

    // Newest first by the flow's last word — the reply that came back, or the question still out.
    return runs.sort((one, other) => this.lastWord(other).getTime() - this.lastWord(one).getTime());
  }

  /** One run opened — every step in the order it ran, every call inside it in its own. */
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

    return {
      ...this.toRun(row, stood, asked),
      // The flow's own questions, so a reader can group the walk by them and not by the clock.
      questions: asked.map((question) => ({
        id: question.id,
        place: question.place,
        asked: question.asked,
        askedAt: question.askedAt,
        // A question written before the record kept an addressee falls back to the agent the run started from.
        askedAgentId: question.askedAgentId ?? row.startedByAgentId,
      })),
      walk,
    };
  }

  /**
   * Where one call stands, by its own id. Nothing is found for a call the record does not hold — a forgotten run
   * takes its calls with it — and then «ПОКАЗАТИ ВИКЛИК» has nowhere to lead, and says so by not being there.
   */
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

  /** One step with everything written beside it: who ran it, on what, with what words, and what it did. */
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
      // A call written before the record knew about servers has no name, and none is not an empty one.
      serverName: row.serverName ?? "",
      // The end is where a server's «ні» is kept, so reading it back is reading that word.
      isFailed: row.end === RUN_CALL_SAID_NO,
      end: row.end,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
    };
  }

  /** One row of the history — the run, and what its steps add up to. */
  private toRun(row: RunEntity, steps: RunStepEntity[], asked: RunQuestionEntity[]): Run {
    // The row of the history is named by the last question of the flow, and dated by it.
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
      // The head of the row names whom the flow was asked last, and the last question is who knows it.
      // A question written before the record kept an addressee falls back to the agent the run started from — the
      // only thing an older record can say, and what the migration wrote into those rows.
      askedAgentId: last?.askedAgentId ?? row.startedByAgentId,
      askedAgentName: last?.askedAgentName ?? row.startedByAgentName,
    };
  }

  /** The flow's last word — the reply that came back, or the question that is still out. */
  private lastWord(run: Run): Date {
    return run.endedAt ?? run.askedAt;
  }

  /** How the flow stands — the state of its last turn, counted on every read. */
  private stateOf(row: RunEntity, steps: RunStepEntity[]): string {
    if (row.endedAt === null) {
      return RUN_RUNNING;
    }

    const last = steps.reduce<RunStepEntity | null>(
      (standing, step) => (standing === null || step.place > standing.place ? step : standing),
      null,
    );

    // A flow closed without a single step sent nothing anywhere — nothing fell, because nothing went.
    if (last === null) {
      return RUN_NOT_SENT;
    }

    // «the last turn» is the last walk, and a walk is not a line — one agent hands to two, the
    // turns run beside each other and come back in whatever order they finish in. Reading only the one that came
    // back last would let a branch that fell hide behind a branch that answered after it, and the row would say
    // «ГОТОВО» over half a walk that never arrived. So every turn of that walk is read, not the latest of them.
    const walk = steps.filter((step) => step.walkId === last.walkId);
    const unanswered = walk.filter((step) => step.state !== RUN_STEP_DONE);

    if (unanswered.length === 0) {
      return RUN_DONE;
    }

    // A stop is a person's act, so a walk the person stopped is stopped and not fallen. Where one branch
    // was stopped and another ended some other way, the other way is the news — a hand explains only what it stopped.
    if (unanswered.every((step) => step.state === RUN_STEP_STOPPED)) {
      return RUN_STOPPED;
    }

    // Where the branches ended differently the worse word is taken, and «УПАВ» is worse than «НЕ ПІШОВ»
    // — a turn that was sent and broke is news of a kind a turn that never left can never be. An end word this side
    // does not know is a new end and not a gentle one, so it counts as a fall rather than quietly as nothing sent.
    const fell = unanswered.filter(
      (step) => step.state !== RUN_STEP_STOPPED && !RUN_STEP_NOT_SENT_ENDS.includes(step.state),
    );

    return fell.length === 0 ? RUN_NOT_SENT : RUN_FAILED;
  }
}

/**
 * The base keeps the reason as text, and the two sides agree on two of them; anything else is a word
 * this side does not know, and a link with no reason it can name is a link that went through.
 */
function stopReasonOf(said: string | null): ChatStopReason | null {
  return said !== null && CHAT_STOP_REASONS.includes(<ChatStopReason>said) ? <ChatStopReason>said : null;
}
