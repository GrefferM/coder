import { cutEnd, notStartedReason, notStartedTurn, turnCost, turnWall } from "../logic";
import { notStartedNote } from "../words";
import { ASK_AGENT_CHANNEL, STOP_AGENT_CHANNEL } from "../../../../../contracts";
import { RUN_STEP_DONE, RUN_STEP_FAILED } from "../../record";
import { CHAT_FAILED_NOTE } from "../constants";
import type { TurnAnswer, TurnCatalogue } from "../interfaces";
import type { Agent, ProjectModel, ProjectPrompt, ProviderState } from "../../../interfaces";

/**
 * One turn asked of the machine. Every wall before the ask is the walk's own, so it is asked first and the
 * model is never troubled; an answer, a refusal at the door or a fall all come back as words with their cost.
 */
export async function answerTurn(
  turnId: string,
  model: ProjectModel | null,
  provider: ProviderState | null,
  prompt: ProjectPrompt | null,
  asked: string,
  directory: string,
  agent: Agent,
  catalogue: TurnCatalogue,
): Promise<TurnAnswer> {
  const wall = turnWall(agent, model, provider, prompt, catalogue, asked);

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
      // A note the app wrote is not an answer: only the agent's own words go down the line.
      isCut: cut !== null,
      notStarted: null,
      wouldGo: null,
      state: cut?.state ?? RUN_STEP_DONE,
      calls: said.calls ?? [],
    };
  } catch (error) {
    const reason = notStartedReason(String(error));

    // Nothing was tried, so nothing failed.
    if (reason !== null) {
      return notStartedTurn(notStartedNote(reason, held, provider), reason);
    }

    // The turn fell, and the agent wears «упав» until one of its own goes through.
    return {
      text: "",
      note: CHAT_FAILED_NOTE,
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
