import { agentTools } from "./agent-tools";
import { notStartedTurn } from "./not-started-turn";
import { turnLength } from "./turn-length";
import { agentNumbers, isAgentFilled, isModelFilled } from "../../../logic";
import { lostFunctionNote, lostPromptNote, notFilledAgentNote, notStartedNote, overCeilingNote } from "../words";
import { unfilledField } from "../../../words";
import { NO_MODEL_NOTE } from "../constants";
import { hasBrokenGrant } from "../../../logic";
import type { TurnAnswer, TurnAsked, TurnToAsk } from "../interfaces";

/**
 * Every wall a turn can meet before it is asked: a lost function or prompt, a number missing from the agent or
 * its model, no model, words over the model's ceiling. The first wall met is the answer; where there is none,
 * what the turn carries to the model comes back instead.
 */
export function turnWall(turn: TurnToAsk): TurnAnswer | TurnAsked {
  const { agent, catalogue, asked } = turn;
  const { model, provider, prompt } = turn.stands;

  // A grant that points at nothing would hand the model a tool that is not there, so the
  // turn waits until the person takes the grant away, declares the command again or brings the server back. Going
  // without it silently would be a different walk under the same question — «хід не йде без функції».
  if (hasBrokenGrant(agent.tools, catalogue.commands, catalogue.servers, catalogue.looks)) {
    return notStartedTurn(lostFunctionNote(agent.name), "lostFunction");
  }

  // A prompt the agent names and the project has lost is a broken tie; going without it would do the work
  // asked for, but not the way it was agreed.
  if (agent.promptId !== null && prompt === null) {
    return notStartedTurn(lostPromptNote(agent.name), "lostPrompt");
  }

  // An agent missing one of its own numbers is asked nothing; the card names the field and its tab
  // mends it.
  if (!isAgentFilled(agent)) {
    return notStartedTurn(notFilledAgentNote(agent.name, unfilledField(agentNumbers(agent)) ?? ""), "notFilledAgent");
  }

  if (model === null) {
    return notStartedTurn(NO_MODEL_NOTE, "noModel");
  }

  // A model missing any of its numbers cannot be asked with it; the card names the field and the
  // form mends it. The prices are among them: a turn whose bill nobody could count is not a turn to send.
  if (!isModelFilled(model)) {
    return notStartedTurn(notStartedNote("notFilled", model, provider), "notFilled");
  }

  const systemPrompt = prompt?.text ?? null;
  const length = turnLength(systemPrompt, asked, model.contextCeiling);

  // Over the ceiling the turn does not go at all.
  if (length.total > length.ceiling) {
    return notStartedTurn(overCeilingNote(model.title, length), "tooLong", length);
  }

  return {
    agent,
    model,
    systemPrompt,
    tools: agentTools(agent.tools, catalogue.commands, catalogue.looks),
  };
}
