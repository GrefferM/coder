/**
 * A compression made under a caller's turn for the question's shared memory of an agent called as a tool, which the
 * record does not hold yet: it is written with the caller's step, when the turn is over. Until then it stands in the
 * record's place for the calls the turn goes on to make, so none of them compresses the same memory again.
 */
export interface UnwrittenMemory {
  /** What the composer wrote, as it stands for the question and the answers up to the place it covers. */
  text: string;
  coversPlace: number;
}
