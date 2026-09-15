/** Where one call stands in the record — enough to open its run and ride to the message it was made from. */
export interface CallPlace {
  runId: string;
  questionId: string;
  /** A call always stands in a step, unlike a found word. */
  stepId: string;
}
