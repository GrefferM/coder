/** One place a searched word stands in: the address of a single message and the words themselves. */
export interface RunHit {
  runId: string;
  questionId: string;
  /** `null` where the words stand in the question itself. */
  stepId: string | null;
  /** Whose message this is; the name is looked up by this id. */
  agentId: string | null;
  /** The agent's name in the record; used only when the project no longer holds the agent. */
  agentName: string | null;
  /** The walk step the message stood on, as in its card's «КРОК N». */
  step: number | null;
  /** The hour the card reads: when the turn began or the question was asked; the list is ordered by it. */
  at: Date;
  /** Text from the start of the sentence it stands in, or of the line for a call. */
  found: string;
  /** A call's words are shown mono; the only mark of their origin. */
  isCall: boolean;
}
