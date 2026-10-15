import { RUN_STEP_DONE, RUN_STEP_FAILED, fellNote } from "../../../contracts";
import { cutEnd, notStartedReason, notStartedTurn, turnCost, turnMessages, turnWall } from "../logic";
import { notStartedNote } from "../words";
import type { FilledModel, SaidTurn, TurnAnswer, TurnAsked, TurnToAsk } from "../../../contracts";
import type { TurnLlm } from "../interfaces";

/**
 * One turn asked of the model layer. Walls are checked first, so the model is never asked past one; an answer, a
 * refusal or a fall all return as words with their cost.
 */
export class TurnAsker {
  constructor(private readonly llm: TurnLlm) {}

  stop(turnId: string): void {
    this.llm.stop({
      turnId,
    });
  }

  async answer(turn: TurnToAsk): Promise<TurnAnswer> {
    const wall = turnWall(turn);

    if ("notStarted" in wall) {
      return wall;
    }

    try {
      return this.answered(await this.put(turn, wall), wall);
    } catch (error) {
      return this.refused(error, wall.model, turn);
    }
  }

  private async put(turn: TurnToAsk, wall: TurnAsked): Promise<SaidTurn> {
    const { agent, model, systemPrompt, tools } = wall;

    return this.llm.ask({
      turnId: turn.turnId,
      agentId: agent.id,
      providerId: model.provider,
      model: model.title,
      directory: turn.directory,
      maxCalls: agent.maxCalls,
      temperature: agent.temperature,
      answerCeiling: model.answerCeiling,
      servers: turn.catalogue.servers,
      systemPrompt,
      messages: turnMessages(turn.memory, turn.asked),
      tools,
      agents: turn.agents,
      runId: turn.runId,
      questionId: turn.questionId,
    });
  }

  /** What the model said, with the end it came to. */
  private answered(said: SaidTurn, wall: TurnAsked): TurnAnswer {
    const { agent, model } = wall;
    const cut = cutEnd(said, agent.maxCalls, model.answerCeiling);

    return {
      text: said.text,
      note: cut?.note ?? null,
      cost: turnCost(said.inputTokens, said.outputTokens, model),
      answerCeiling: model.answerCeiling,
      isFailure: false,
      fell: null,
      isCut: cut !== null,
      notStarted: null,
      wouldGo: null,
      state: cut?.state ?? RUN_STEP_DONE,
      calls: said.calls ?? [],
    };
  }

  /** A turn that never began where a wall of the machine refused it, else a fall with the provider's own sentence. */
  private refused(error: unknown, model: FilledModel, turn: TurnToAsk): TurnAnswer {
    const thrown = error instanceof Error ? error.message : String(error);
    const reason = notStartedReason(thrown);

    if (reason !== null) {
      return notStartedTurn(notStartedNote(reason, model, turn.stands.provider), reason);
    }

    const said = thrown.trim();

    return {
      text: "",
      note: fellNote(said),
      fell: said,
      cost: null,
      answerCeiling: model.answerCeiling,
      isFailure: true,
      isCut: false,
      notStarted: null,
      wouldGo: null,
      state: RUN_STEP_FAILED,
      calls: [],
    };
  }
}
