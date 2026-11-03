import {
  RUN_STEP_DONE,
  RUN_STEP_FAILED,
  addedCost,
  codePoints,
  composedOutcome,
  composerAsk,
  composerBudget,
  fellNote,
  memoryLength,
  turnCost,
  turnMessages,
  sharesMemory,
} from "../../../contracts";
import { cutEnd, notStartedReason, notStartedTurn, turnWall } from "../logic";
import { notStartedNote } from "../words";
import type {
  ChatCost,
  CompressedMemory,
  CompressionSettings,
  FilledModel,
  SaidTurn,
  TurnAnswer,
  TurnAsked,
  TurnMemory,
  TurnToAsk,
} from "../../../contracts";
import type { TurnLlm } from "../interfaces";

/** A memory the composer wrote on the way to a turn, with what the call cost and what the turn then goes with. */
interface Composed {
  cost: ChatCost | null;
  compressed: CompressedMemory;
  memory: TurnMemory;
}

/**
 * One turn asked of the model layer. Walls are checked first, so the model is never asked past one; where the memory
 * has to be compressed first, the composer is asked once and the turn goes with its message. An answer, a refusal or a
 * fall all return as words with their cost, the composer's included.
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

    let composed: Composed | null = null;

    try {
      if (wall.compression !== null) {
        const budget = composerBudget(wall.agent.memory, wall.compression.budget);
        const said = await this.compose(turn, wall, budget);

        // A stop is the person's act, not the composer's fall; what it had written is not a memory, but what it used
        // is spent.
        if (said.isStopped) {
          return this.answered(
            {
              ...said,
              text: "",
            },
            wall,
            null,
          );
        }

        composed = this.composed(turn, wall, said, budget, wall.compression);
      }

      const memory = composed?.memory ?? turn.memory;

      return this.answered(
        await this.put(
          {
            ...turn,
            memory,
          },
          wall,
        ),
        wall,
        composed,
      );
    } catch (error) {
      return this.refused(error, wall.model, turn, composed);
    }
  }

  /** The composer, asked for the main of the whole memory in no more than so many words, the most important first. */
  private async compose(turn: TurnToAsk, wall: TurnAsked, budget: number): Promise<SaidTurn> {
    const { agent, model } = wall;

    return this.llm.compose({
      turnId: turn.turnId,
      providerId: model.provider,
      model: model.title,
      temperature: agent.temperature,
      answerCeiling: model.answerCeiling,
      messages: composerAsk(turn.memory, model.contextCeiling, budget),
      runId: turn.runId,
      questionId: turn.questionId,
    });
  }

  /** What the composer wrote, with the memory the turn goes with in place of the one it read, and what it cost. */
  private composed(
    turn: TurnToAsk,
    wall: TurnAsked,
    said: SaidTurn,
    budget: number,
    compression: CompressionSettings,
  ): Composed {
    const { agent, model } = wall;
    const { text, memory } = composedOutcome(said.text, budget, agent.memory, turn.memory.covers);
    const cost = turnCost(said.inputTokens, said.outputTokens, model);

    return {
      cost,
      memory,
      compressed: {
        facts: {
          agentId: agent.id,
          questionId: sharesMemory(agent.memory) ? turn.questionId : null,
          coversPlace: turn.memory.covers,
          text,
          lengthBefore: memoryLength(turn.memory),
          lengthAfter: codePoints(text),
          compressAt: compression.at,
          compressTo: compression.to,
          inputTokens: cost?.inputTokens ?? 0,
          outputTokens: cost?.outputTokens ?? 0,
          money: cost?.money ?? null,
        },
        carried: memoryLength(memory),
      },
    };
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

  /** What the model said, with the end it came to; the composer's cost, where it was asked, is part of the turn's. */
  private answered(said: SaidTurn, wall: TurnAsked, composed: Composed | null): TurnAnswer {
    const { agent, model } = wall;
    const cut = cutEnd(said, agent.maxCalls, model.answerCeiling);

    return {
      text: said.text,
      note: cut?.note ?? null,
      // The turn's own bill, the composer's before it, and what the agents it called cost, theirs and their composers'.
      cost: [
        composed?.cost ?? null,
        turnCost(said.inputTokens, said.outputTokens, model),
        said.called,
        ...said.memories.map((one) => one.cost),
      ].reduce<ChatCost | null>(addedCost, null),
      answerCeiling: model.answerCeiling,
      isFailure: false,
      fell: null,
      isCut: cut !== null,
      notStarted: null,
      wouldGo: null,
      waitsFor: null,
      state: cut?.state ?? RUN_STEP_DONE,
      calls: said.calls ?? [],
      compressed: composed?.compressed ?? null,
      // Those of the agents it called whose memory the record keeps; the rest are only paid for, above.
      toolMemories: said.memories.flatMap((one) => (one.facts === null ? [] : [one.facts])),
      route: said.route,
    };
  }

  /** A turn that never began where a wall of the machine refused it, else a fall with the provider's own sentence. */
  private refused(error: unknown, model: FilledModel, turn: TurnToAsk, composed: Composed | null): TurnAnswer {
    const thrown = error instanceof Error ? error.message : String(error);
    const reason = composed === null ? notStartedReason(thrown) : null;

    if (reason !== null) {
      return notStartedTurn(notStartedNote(reason, model, turn.stands.provider), reason);
    }

    const said = thrown.trim();

    return {
      text: "",
      note: fellNote(said),
      fell: said,
      // What the composer already used is spent, whatever came after.
      cost: composed?.cost ?? null,
      answerCeiling: model.answerCeiling,
      isFailure: true,
      isCut: false,
      notStarted: null,
      wouldGo: null,
      waitsFor: null,
      state: RUN_STEP_FAILED,
      calls: [],
      compressed: composed?.compressed ?? null,
      toolMemories: [],
      route: null,
    };
  }
}
