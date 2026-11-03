import type { AskedSaid, ChatMessage } from "../../../contracts";

/**
 * The cards for the words a turn was given: the person's question, or what arrived down each line, one card per line in
 * drawing order. A repeat adds none.
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
    waitsFor: null,
    calls: [],
    began: null,
    stepId: null,
    walkId: said.runKey,
    note: null,
    asked: null,
    fedBy: [],
    // A person's question carries its attached files; work down a line carries none.
    attached: one.attached.map((file) => ({
      name: file.name,
      kind: file.kind,
    })),
    compressed: null,
  }));
}
