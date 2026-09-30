/** One argument that did not hold to its declared type. */
export interface ToolComplaint {
  /** The parameter the check stopped at. */
  name: string;
  /** What the type asked for; the call's grey line says only this. */
  wrong: string;
  /** What came instead and the list it had to be from; only the model's note carries it. */
  told: string;
}
