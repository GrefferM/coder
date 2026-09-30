/** Where one call stands in the record: enough to open its run and reach its message. */
export interface CallPlace {
  runId: string;
  questionId: string;
  /** A call always stands in a step, unlike a found word. */
  stepId: string;
}
