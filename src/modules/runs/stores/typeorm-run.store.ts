import { In, IsNull, MoreThan } from "typeorm";
import type {
  RunCallEntity,
  RunEntity,
  RunHandoffEntity,
  RunMemoryEntity,
  RunQuestionAttachmentEntity,
  RunQuestionRecordingEntity,
  RunQuestionEntity,
  RunStepAgentEntity,
  RunStepEntity,
  RunStepFeedEntity,
  RunStepModelEntity,
  RunStepSettingEntity,
} from "../entities";
import type {
  NewAttachment,
  NewRecording,
  NewCall,
  NewFeed,
  NewGiven,
  NewHandoff,
  NewMemory,
  NewQuestion,
  NewRan,
  NewRun,
  NewStep,
  NewWho,
  RunStore,
  RunTables,
} from "../interfaces";
import { runTablesOf } from "./run-tables";

/** The record's questions answered over TypeORM; the services know only `RunStore`. */
export class TypeormRunStore implements RunStore {
  constructor(private readonly tables: RunTables) {}

  async inOne<T>(work: (store: RunStore) => Promise<T>): Promise<T> {
    return this.tables.runs.manager.transaction((manager) => work(new TypeormRunStore(runTablesOf(manager))));
  }

  async openRun(run: NewRun): Promise<RunEntity> {
    return this.tables.runs.save({
      ...run,
      endedAt: null,
    });
  }

  async runById(id: string): Promise<RunEntity | null> {
    return this.tables.runs.findOneBy({
      id,
    });
  }

  async runsIn(directory: string): Promise<RunEntity[]> {
    return this.tables.runs.find({
      where: {
        directory,
      },
    });
  }

  async allRuns(): Promise<RunEntity[]> {
    return this.tables.runs.find();
  }

  async runsStillOpen(): Promise<RunEntity[]> {
    return this.tables.runs.find({
      where: {
        endedAt: IsNull(),
      },
    });
  }

  async endRun(id: string, endedAt: Date | null): Promise<void> {
    await this.tables.runs.update(id, {
      endedAt,
    });
  }

  async dropRun(id: string): Promise<void> {
    await this.tables.runs.delete({
      id,
    });
  }

  async askIn(question: NewQuestion): Promise<RunQuestionEntity> {
    return this.tables.questions.save({
      id: question.id,
      place: question.place,
      asked: question.asked,
      askedAt: question.askedAt,
      askedAgentId: question.askedAgentId,
      askedAgentName: question.askedAgentName,
      run: {
        id: question.runId,
      },
    });
  }

  async askedIn(runId: string): Promise<RunQuestionEntity[]> {
    const stood = await this.tables.questions.find({
      where: {
        run: {
          id: runId,
        },
      },
    });

    return stood.sort((one, other) => one.place - other.place);
  }

  async askedInRuns(runIds: string[]): Promise<RunQuestionEntity[]> {
    if (runIds.length === 0) {
      return [];
    }

    return this.tables.questions.find({
      where: {
        run: {
          id: In(runIds),
        },
      },
      // The run is read off each question; relations the query does not name come back empty.
      relations: {
        run: true,
      },
    });
  }

  async dropQuestionsOf(runId: string): Promise<void> {
    await this.tables.questions.delete({
      run: {
        id: runId,
      },
    });
  }

  async attachTo(attachment: NewAttachment): Promise<void> {
    await this.tables.attachments.save({
      place: attachment.place,
      path: attachment.path,
      name: attachment.name,
      kind: attachment.kind,
      text: attachment.text,
      binaries: attachment.binaries,
      question: {
        id: attachment.questionId,
      },
    });
  }

  async attachedTo(questionIds: string[]): Promise<RunQuestionAttachmentEntity[]> {
    if (questionIds.length === 0) {
      return [];
    }

    return this.tables.attachments.find({
      where: {
        question: {
          id: In(questionIds),
        },
      },
      // The question is read off each attachment; relations the query does not name come back empty.
      relations: {
        question: true,
      },
    });
  }

  async dropAttachedOf(runId: string): Promise<void> {
    const asked = await this.askedIn(runId);

    if (asked.length === 0) {
      return;
    }

    await this.tables.attachments.delete({
      question: {
        id: In(asked.map((question) => question.id)),
      },
    });
  }

  async keepRecording(recording: NewRecording): Promise<void> {
    await this.tables.recordings.save({
      place: recording.place,
      mimeType: recording.mimeType,
      durationMs: recording.durationMs,
      peaks: recording.peaks,
      sound: recording.sound,
      question: {
        id: recording.questionId,
      },
    });
  }

  async recordingsOf(questionIds: string[]): Promise<RunQuestionRecordingEntity[]> {
    if (questionIds.length === 0) {
      return [];
    }

    return this.tables.recordings.find({
      where: {
        question: {
          id: In(questionIds),
        },
      },
      relations: {
        question: true,
      },
    });
  }

  async recordingSound(id: string): Promise<Buffer | null> {
    const row = await this.tables.recordings.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        sound: true,
      },
    });

    return row?.sound ?? null;
  }

  async dropRecordingsOf(runId: string): Promise<void> {
    const asked = await this.askedIn(runId);

    if (asked.length === 0) {
      return;
    }

    await this.tables.recordings.delete({
      question: {
        id: In(asked.map((question) => question.id)),
      },
    });
  }

  async stepsOf(runId: string): Promise<RunStepEntity[]> {
    return this.tables.steps.find({
      where: {
        run: {
          id: runId,
        },
      },
    });
  }

  async walkOf(runId: string): Promise<RunStepEntity[]> {
    return this.tables.steps.find({
      where: {
        run: {
          id: runId,
        },
      },
      // The question is read off each step; relations the query does not name come back empty.
      relations: {
        question: true,
      },
    });
  }

  async walksOf(runIds: string[]): Promise<RunStepEntity[]> {
    if (runIds.length === 0) {
      return [];
    }

    return this.tables.steps.find({
      where: {
        run: {
          id: In(runIds),
        },
      },
      relations: {
        run: true,
        question: true,
      },
    });
  }

  async stepsOfQuestion(runId: string, questionId: string, afterPlace: number): Promise<RunStepEntity[]> {
    return this.tables.steps.find({
      where: {
        run: {
          id: runId,
        },
        question: {
          id: questionId,
        },
        place: MoreThan(afterPlace),
      },
      order: {
        place: "ASC",
      },
    });
  }

  async stepsOfAgent(runId: string, agentId: string, afterPlace: number): Promise<RunStepEntity[]> {
    return this.tables.steps
      .createQueryBuilder("step")
      .innerJoin("step.run", "run")
      .innerJoinAndSelect("step.who", "who")
      .where("run.id = :runId", {
        runId,
      })
      .andWhere("who.agentId = :agentId", {
        agentId,
      })
      .andWhere("step.place > :afterPlace", {
        afterPlace,
      })
      .orderBy("step.place", "ASC")
      .getMany();
  }

  async addStep(step: NewStep): Promise<RunStepEntity> {
    return this.tables.steps.save({
      place: step.place,
      walkId: step.walkId,
      asked: step.asked,
      said: step.said,
      state: step.state,
      waitsFor: step.waitsFor,
      inputTokens: step.inputTokens,
      outputTokens: step.outputTokens,
      money: step.money,
      startedAt: step.startedAt,
      endedAt: step.endedAt,
      question: {
        id: step.questionId,
      },
      run: {
        id: step.runId,
      },
    });
  }

  async dropStepsOf(runId: string): Promise<void> {
    await this.tables.steps.delete({
      run: {
        id: runId,
      },
    });
  }

  async addWho(who: NewWho): Promise<void> {
    await this.tables.who.save({
      agentId: who.agentId,
      name: who.name,
      color: who.color,
      step: {
        id: who.stepId,
      },
    });
  }

  async whoOf(stepId: string): Promise<RunStepAgentEntity | null> {
    return this.tables.who.findOne({
      where: {
        step: {
          id: stepId,
        },
      },
    });
  }

  async whoIn(stepIds: string[]): Promise<RunStepAgentEntity[]> {
    if (stepIds.length === 0) {
      return [];
    }

    return this.tables.who.find({
      where: {
        step: {
          id: In(stepIds),
        },
      },
      relations: {
        step: true,
      },
    });
  }

  async addRan(ran: NewRan): Promise<void> {
    await this.tables.ran.save({
      modelId: ran.modelId,
      title: ran.title,
      providerId: ran.providerId,
      inputPrice: ran.inputPrice,
      outputPrice: ran.outputPrice,
      contextCeiling: ran.contextCeiling,
      answerCeiling: ran.answerCeiling,
      step: {
        id: ran.stepId,
      },
    });
  }

  async ranOf(stepId: string): Promise<RunStepModelEntity | null> {
    return this.tables.ran.findOne({
      where: {
        step: {
          id: stepId,
        },
      },
    });
  }

  async addGiven(given: NewGiven): Promise<void> {
    await this.tables.given.save({
      promptId: given.promptId,
      prompt: given.prompt,
      temperature: given.temperature,
      maxCalls: given.maxCalls,
      memoryLength: given.memoryLength,
      step: {
        id: given.stepId,
      },
    });
  }

  async givenOf(stepId: string): Promise<RunStepSettingEntity | null> {
    return this.tables.given.findOne({
      where: {
        step: {
          id: stepId,
        },
      },
    });
  }

  async addCall(call: NewCall): Promise<void> {
    await this.tables.calls.save({
      id: call.id,
      source: call.source,
      place: call.place,
      name: call.name,
      arguments: call.arguments,
      pinned: call.pinned,
      line: call.line,
      output: call.output,
      refusal: call.refusal,
      exitCode: call.exitCode,
      serverId: call.serverId,
      serverName: call.serverName,
      end: call.end,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      step: {
        id: call.stepId,
      },
    });
  }

  async callById(id: string): Promise<RunCallEntity | null> {
    return this.tables.calls.findOne({
      where: {
        id,
      },
      // A call's place is its step's: the run and the question it grew from.
      relations: {
        step: {
          run: true,
          question: true,
        },
      },
    });
  }

  async callsOf(stepId: string): Promise<RunCallEntity[]> {
    return this.tables.calls.find({
      where: {
        step: {
          id: stepId,
        },
      },
    });
  }

  async callsIn(stepIds: string[]): Promise<RunCallEntity[]> {
    if (stepIds.length === 0) {
      return [];
    }

    return this.tables.calls.find({
      where: {
        step: {
          id: In(stepIds),
        },
      },
      relations: {
        step: true,
      },
    });
  }

  async addFeed(feed: NewFeed): Promise<void> {
    await this.tables.feeds.save({
      place: feed.place,
      step: {
        id: feed.stepId,
      },
      from: {
        id: feed.fromStepId,
      },
    });
  }

  async feedsOf(stepId: string): Promise<RunStepFeedEntity[]> {
    return this.tables.feeds.find({
      where: {
        step: {
          id: stepId,
        },
      },
      relations: {
        from: true,
      },
    });
  }

  async feedsIn(stepIds: string[]): Promise<RunStepFeedEntity[]> {
    if (stepIds.length === 0) {
      return [];
    }

    return this.tables.feeds.find({
      where: {
        step: {
          id: In(stepIds),
        },
      },
      relations: {
        step: true,
        from: true,
      },
    });
  }

  async addHandoff(handoff: NewHandoff): Promise<void> {
    await this.tables.handoffs.save({
      place: handoff.place,
      toAgentId: handoff.toAgentId,
      stopReason: handoff.stopReason,
      text: handoff.text,
      step: {
        id: handoff.stepId,
      },
    });
  }

  async handoffsOf(stepId: string): Promise<RunHandoffEntity[]> {
    return this.tables.handoffs.find({
      where: {
        step: {
          id: stepId,
        },
      },
    });
  }

  async addMemory(memory: NewMemory): Promise<void> {
    await this.tables.memories.save({
      agentId: memory.agentId,
      coversPlace: memory.coversPlace,
      text: memory.text,
      lengthBefore: memory.lengthBefore,
      lengthAfter: memory.lengthAfter,
      compressAt: memory.compressAt,
      compressTo: memory.compressTo,
      inputTokens: memory.inputTokens,
      outputTokens: memory.outputTokens,
      money: memory.money,
      run: {
        id: memory.runId,
      },
      question:
        memory.questionId === null
          ? null
          : {
              id: memory.questionId,
            },
      step: {
        id: memory.stepId,
      },
    });
  }

  async memoriesOf(runId: string): Promise<RunMemoryEntity[]> {
    return this.tables.memories.find({
      where: {
        run: {
          id: runId,
        },
      },
      relations: {
        question: true,
        step: true,
      },
    });
  }

  async latestMemoryOf(runId: string, agentId: string, questionId: string | null): Promise<RunMemoryEntity | null> {
    const query = this.tables.memories
      .createQueryBuilder("memory")
      .innerJoin("memory.run", "run")
      .innerJoinAndSelect("memory.step", "step")
      .leftJoinAndSelect("memory.question", "question")
      .where("run.id = :runId", {
        runId,
      })
      .andWhere("memory.agentId = :agentId", {
        agentId,
      });

    return (
      questionId === null
        ? query.andWhere("question.id IS NULL")
        : query.andWhere("question.id = :questionId", {
            questionId,
          })
    )
      .orderBy("step.place", "DESC")
      .limit(1)
      .getOne();
  }

  async dropBesideStep(stepId: string): Promise<void> {
    const beside = {
      step: {
        id: stepId,
      },
    };

    await this.tables.calls.delete(beside);
    await this.tables.feeds.delete(beside);
    // A step may also be a supplier; that row hangs off the step it fed.
    await this.tables.feeds.delete({
      from: {
        id: stepId,
      },
    });
    await this.tables.handoffs.delete(beside);
    await this.tables.who.delete(beside);
    await this.tables.ran.delete(beside);
    await this.tables.given.delete(beside);
    await this.tables.memories.delete(beside);
  }
}
