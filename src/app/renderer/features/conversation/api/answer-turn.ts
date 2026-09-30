import { cutEnd, notStartedReason, notStartedTurn, providerWords, turnCost, turnWall } from "../logic";
import { notStartedNote } from "../words";
import { ASK_AGENT_CHANNEL, STOP_AGENT_CHANNEL } from "../../../../../contracts";
import { RUN_STEP_DONE, RUN_STEP_FAILED } from "../../record";
import { fellNote } from "../words";
import type { TurnAnswer, TurnToAsk } from "../interfaces";

/**
 * One turn asked of the machine. Walls are checked first, so the model is never asked past one; an answer, a refusal or
 * a fall all return as words with their cost. The agent's thread of this conversation goes ahead of the question.
 */
export async function answerTurn(turn: TurnToAsk): Promise<TurnAnswer> {
  const { turnId, asked, thread, catalogue, agents, directory } = turn;
  const wall = turnWall(turn);

  if ("notStarted" in wall) {
    return wall;
  }

  const { agent: filled, model: held, systemPrompt, tools } = wall;

  try {
    const said = await window.electronApi.invoke(ASK_AGENT_CHANNEL, {
      turnId,
      agentId: filled.id,
      providerId: held.provider,
      model: held.title,
      directory,
      maxCalls: filled.maxCalls,
      temperature: filled.temperature,
      answerCeiling: held.answerCeiling,
      // A granted function names its server by id; this answers that id.
      servers: catalogue.servers,
      systemPrompt,
      messages: [
        ...thread,
        {
          from: "person",
          text: asked,
        },
      ],
      tools,
      agents,
    });
    const cut = cutEnd(said, filled.maxCalls, held.answerCeiling);

    return {
      // A card holds only the model's words.
      text: said.text,
      note: cut?.note ?? null,
      cost: turnCost(said.inputTokens, said.outputTokens, held),
      answerCeiling: held.answerCeiling,
      isFailure: false,
      fell: null,
      // A note the app wrote is not an answer; only the agent's own words go down the line.
      isCut: cut !== null,
      notStarted: null,
      wouldGo: null,
      state: cut?.state ?? RUN_STEP_DONE,
      calls: said.calls ?? [],
    };
  } catch (error) {
    const thrown = error instanceof Error ? error.message : String(error);
    const reason = notStartedReason(thrown);

    // Nothing was tried, so nothing failed.
    if (reason !== null) {
      return notStartedTurn(notStartedNote(reason, held, turn.stands.provider), reason);
    }

    // The turn fell; the agent wears «упав» until one of its turns succeeds. The provider's own sentence goes with it.
    const said = providerWords(thrown);

    return {
      text: "",
      note: fellNote(said),
      fell: said,
      cost: null,
      answerCeiling: held.answerCeiling,
      isFailure: true,
      isCut: false,
      notStarted: null,
      wouldGo: null,
      state: RUN_STEP_FAILED,
      // The turn threw, so nothing came back; calls run before it are lost.
      calls: [],
    };
  }
}

/** Ends a turn still out; a machine that no longer has it is silent, and so are we. */
export async function stopTurn(turnId: string): Promise<void> {
  await window.electronApi
    .invoke(STOP_AGENT_CHANNEL, {
      turnId,
    })
    .catch(() => undefined);
}
