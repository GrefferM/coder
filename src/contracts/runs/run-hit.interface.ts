/**
 * One place a searched word stands in: the address of a single message and the words themselves. Facts about the
 * run are not repeated here — they are said once, on the rule over the group.
 */
export interface RunHit {
  runId: string;
  questionId: string;
  /** Null where the words stand in the question itself, which the rule line carries. */
  stepId: string | null;
  /** Whose message this is; the name is looked up by this id, never by what the record called them. */
  agentId: string | null;
  /** What that agent was called then; it stands only for an agent the project no longer holds. */
  agentName: string | null;
  /** Which step of the walk the message stood on — the same «КРОК N» its card wears. */
  step: number | null;
  /** The hour the card reads: when the turn began, or when the question was asked. The list is ordered by it. */
  at: Date;
  /** From the start of the sentence it stands in, or of the line for a call. */
  found: string;
  /** A call's words stand mono, and that is the one mark of where they came from. */
  isCall: boolean;
}
