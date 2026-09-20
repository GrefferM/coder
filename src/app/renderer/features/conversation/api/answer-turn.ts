import { cutEnd, notStartedReason, notStartedTurn, providerWords, turnCost, turnWall } from "../logic";
import { notStartedNote } from "../words";
import { ASK_AGENT_CHANNEL, STOP_AGENT_CHANNEL } from "../../../../../contracts";
import { RUN_STEP_DONE, RUN_STEP_FAILED } from "../../record";
import { fellNote } from "../words";
import type { TurnAnswer, TurnToAsk } from "../interfaces";

/**
 * One turn asked of the machine. Every wall before the ask is the walk's own, so it is asked first and the
 * model is never troubled; an answer, a refusal at the door or a fall all come back as words with their cost.
 *
 * The agent's own thread of this conversation goes out ahead of the question, so the model is answering
 * the latest of a conversation rather than a question out of nowhere.
 */
export async function answerTurn(turn: TurnToAsk): Promise<TurnAnswer> {
  const { turnId, asked, thread, catalogue, directory } = turn;
  const wall = turnWall(turn);

  if ("notStarted" in wall) {
    return wall;
  }

  const { agent: filled, model: held, systemPrompt, tools } = wall;

  try {
    const said = await window.electronApi.invoke(ASK_AGENT_CHANNEL, {
      turnId,
      providerId: held.provider,
      model: held.title,
      directory,
      maxCalls: filled.maxCalls,
      temperature: filled.temperature,
      answerCeiling: held.answerCeiling,
      // A granted function names its server by id; this is where that id is answered.
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
    });
    const cut = cutEnd(said, filled.maxCalls, held.answerCeiling);

    return {
      // A card holds the model's words alone; ours stand on the rule under it.
      text: said.text,
      note: cut?.note ?? null,
      cost: turnCost(said.inputTokens, said.outputTokens, held),
      answerCeiling: held.answerCeiling,
      isFailure: false,
      fell: null,
      // A note the app wrote is not an answer: only the agent's own words go down the line.
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

    // The turn fell, and the agent wears «упав» until one of its own goes through. The provider's own sentence
    // goes with it — a fall that says only that it fell sends the person to a terminal to learn why.
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
      // The turn threw, so nothing came back — what it ran before that is lost with it.
      calls: [],
    };
  }
}

/** Ends a turn that is still out; a machine that no longer has it says nothing and neither do we. */
export async function stopTurn(turnId: string): Promise<void> {
  await window.electronApi
    .invoke(STOP_AGENT_CHANNEL, {
      turnId,
    })
    .catch(() => undefined);
}
