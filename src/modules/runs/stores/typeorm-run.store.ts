import { In, IsNull } from "typeorm";
import type {
  RunCallEntity,
  RunEntity,
  RunHandoffEntity,
  RunQuestionEntity,
  RunStepAgentEntity,
  RunStepEntity,
  RunStepFeedEntity,
  RunStepModelEntity,
  RunStepSettingEntity,
} from "../entities";
import type {
  NewCall,
  NewFeed,
  NewGiven,
  NewHandoff,
  NewQuestion,
  NewRan,
  NewRun,
  NewStep,
  NewWho,
  RunStore,
  RunTables,
} from "../interfaces";

/** The record's questions answered over TypeORM; the only file in the module that knows of the ORM. */
export class TypeormRunStore implements RunStore {
  constructor(private readonly tables: RunTables) {}

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

  async addStep(step: NewStep): Promise<RunStepEntity> {
    return this.tables.steps.save({
      place: step.place,
      walkId: step.walkId,
      asked: step.asked,
      said: step.said,
      state: step.state,
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
      // The call keeps its existing id.
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
  }
}
