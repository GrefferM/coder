import type { AskedSaid, ChatMessage } from "../interfaces";

/**
 * The cards the words a turn was given become: the person's own question, or what arrived down each line, one
 * card each in the order the lines were drawn. A repeat says nothing again — those words already stand above it.
 */
export function askedCards(said: AskedSaid): ChatMessage[] {
  return (said.isAgain ? [] : said.incoming).map((one, at) => ({
    id: said.ids[at],
    agentId: said.agentId,
    from: one.fromAgentId === null ? "person" : "supplier",
    text: one.text,
    at: new Date(said.at).toISOString(),
    questionId: said.questionId,
    askedAt: said.askedAt,
    cost: one.cost,
    answerCeiling: null,
    otherAgentId: one.fromAgentId,
    stopReason: null,
    isFailure: false,
    notStarted: null,
    wouldGo: null,
    calls: [],
    began: null,
    stepId: null,
    walkId: said.runKey,
    note: null,
    asked: null,
    fedBy: [],
    // A person's question carries the files attached to it; work down a line carries none.
    attached: one.attached.map((file) => ({
      name: file.name,
      kind: file.kind,
    })),
  }));
}
